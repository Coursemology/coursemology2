# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Marketplace::PreviewAttemptsController, type: :controller do
  let!(:instance) { Instance.default }
  with_tenant(:instance) do
    render_views
    let(:course) { create(:course) }
    let(:manager) { create(:course_manager, course: course).user }
    let(:other_manager) { create(:course_manager, course: course).user }
    let(:source_assessment) { create(:assessment, :published, :with_mcq_question) }
    let!(:listing) do
      create(:course_assessment_marketplace_listing, assessment: source_assessment)
    end

    before do
      create(:course_assessment_marketplace_allowlist_rule, rule_type: :user, user: manager)
      create(:course_assessment_marketplace_allowlist_rule, rule_type: :user, user: other_manager)
      controller_sign_in(controller, manager)
    end

    describe 'POST #create' do
      subject { post :create, params: { course_id: course.id, listing_id: listing.id, format: :json } }

      it 'creates a preview attempt owned by the previewer and returns id + assessmentId + answers' do
        expect { subject }.to change { Course::Assessment::Attempt.previews.count }.by(1)
        body = response.parsed_body
        expect(body['id']).to be_present
        expect(body['assessmentId']).to eq(source_assessment.id)
        attempt = Course::Assessment::Attempt.find(body['id'])
        expect(attempt.creator).to eq(manager)
        expect(attempt.assessment).to eq(source_assessment)
        expect(attempt.answers).not_to be_empty
      end

      it 'resumes the existing preview (same id), not a second row' do
        subject
        original_id = response.parsed_body['id']
        expect { post :create, params: { course_id: course.id, listing_id: listing.id, format: :json } }.
          not_to(change { Course::Assessment::Attempt.previews.count })
        expect(response.parsed_body['id']).to eq(original_id)
      end

      it 'gives a different manager their own separate preview on the same listing' do
        subject
        first_id = response.parsed_body['id']
        controller_sign_in(controller, other_manager)
        expect { post :create, params: { course_id: course.id, listing_id: listing.id, format: :json } }.
          to change { Course::Assessment::Attempt.previews.count }.by(1)
        expect(response.parsed_body['id']).not_to eq(first_id)
      end

      context 'when the listing is not published' do
        let(:unpublished_assessment) { create(:assessment, :with_mcq_question) }
        let!(:unpublished_listing) do
          create(:course_assessment_marketplace_listing, assessment: unpublished_assessment, published: false)
        end
        it 'is denied (published-listing gate)' do
          expect do
            post :create, params: { course_id: course.id, listing_id: unpublished_listing.id, format: :json }
          end.to raise_exception(CanCan::AccessDenied)
        end
      end

      context 'when the previewer already has a real submission for the assessment' do
        before do
          create(:course_student, course: source_assessment.course, user: manager)
          create(:submission, assessment: source_assessment, creator: manager)
        end
        it 'returns 409 without reusing the real submission or creating a preview' do
          expect { subject }.not_to(change { Course::Assessment::Attempt.previews.count })
          expect(response).to have_http_status(:conflict)
        end
      end

      context 'when the requester is not a manager' do
        let(:student) { create(:course_student, course: course).user }
        before do
          create(:course_assessment_marketplace_allowlist_rule, rule_type: :user, user: student)
          controller_sign_in(controller, student)
        end
        it 'is denied' do
          expect { subject }.to raise_exception(CanCan::AccessDenied)
        end
      end
    end

    describe 'GET #edit' do
      let(:attempt) do
        a = create(:course_assessment_attempt, assessment: source_assessment, creator: manager)
        a.create_new_answers
        a.answers.reload
        a
      end
      subject { get :edit, params: { course_id: course.id, id: attempt.id, format: :json } }

      it 'renders the reused submission edit payload for the preview attempt' do
        subject
        expect(response).to have_http_status(:ok)
        expect(response.parsed_body['submission']['id']).to eq(attempt.id)
        expect(response.parsed_body['submission']['submitter']).to have_key('name')
        # preview submitter has no course_user id
        expect(response.parsed_body['submission']['submitter']['id']).to be_nil
        expect(response.parsed_body['questions']).not_to be_empty
      end

      context 'when the requester is a different manager (not the creator)' do
        before { controller_sign_in(controller, other_manager) }
        it 'is denied (proves the creator scoping on :read)' do
          expect { subject }.to raise_exception(CanCan::AccessDenied)
        end
      end
    end

    describe 'POST #auto_grade' do
      let(:source_assessment) { create(:assessment, :published, :with_mcq_question, :autograded) }
      let(:attempt) do
        a = create(:course_assessment_attempt, assessment: source_assessment, creator: manager)
        a.create_new_answers
        # Must finalise first: the grading service SKIPS attempting answers, so without this an inert
        # `grade` would still pass a "renders 200" test. Finalise via the ATTEMPT event (deferred
        # workflow persistence — a bare answer.finalise! never hits the DB).
        a.finalise!
        a
      end
      subject { post :auto_grade, params: { course_id: course.id, id: attempt.id, format: :json } }

      it 'grades the attempt for the owner (the answer actually transitions state)' do
        answer = attempt.current_answers.first
        expect(answer.workflow_state).to eq('submitted')
        subject
        expect(response).to have_http_status(:ok)
        # Autograded assessment: Answer::AutoGradingService#evaluate publishes straight through to
        # 'graded' (not just 'evaluated') once evaluate! finds the assessment autograded.
        expect(answer.reload.workflow_state).to eq('graded')
      end

      context 'when the requester is a different manager (not the creator)' do
        before { controller_sign_in(controller, other_manager) }
        it 'is denied' do
          expect { subject }.to raise_exception(CanCan::AccessDenied)
        end
      end
    end

    describe 'POST #reset' do
      let(:attempt) do
        a = create(:course_assessment_attempt, assessment: source_assessment, creator: manager)
        a.create_new_answers
        # `finalise!` alone only transitions workflow_state in memory (the app-wide deferred workflow
        # persistence adapter, lib/extensions/deferred_workflow_state_persistence) — an explicit `save!`
        # is needed to persist it, mirroring how Submission#finalise! chains `attempt.finalise!; save!`.
        a.finalise!
        a.save!
        a
      end
      subject { post :reset, params: { course_id: course.id, id: attempt.id, format: :json } }

      it 'returns the attempt to a fresh attempting state with new answers, reusing the same row' do
        original_answer_ids = attempt.current_answers.map(&:id)
        expect(attempt.reload.workflow_state).to eq('submitted')

        expect { subject }.not_to(change { Course::Assessment::Attempt.previews.count })

        expect(response).to have_http_status(:ok)
        attempt.reload
        expect(attempt.workflow_state).to eq('attempting')
        expect(attempt.current_answers).not_to be_empty
        expect(attempt.current_answers.all?(&:attempting?)).to be(true)
        expect(attempt.current_answers.map(&:id)).not_to match_array(original_answer_ids)
      end

      context 'when the requester is a different manager (not the creator)' do
        before { controller_sign_in(controller, other_manager) }
        it 'is denied' do
          expect { subject }.to raise_exception(CanCan::AccessDenied)
        end
      end
    end

    # PATCH #update goes through the REAL platform path: delegate_to_service(:update) →
    # PreviewUpdateService. Each example asserts a persisted state change, not just a 200.
    describe 'PATCH #update' do
      let(:attempt) do
        a = create(:course_assessment_attempt, assessment: source_assessment, creator: manager)
        a.create_new_answers
        a.answers.reload
        a
      end

      it 'saves answer changes (the update is not a no-op)' do
        answer = attempt.current_answers.first
        option = answer.question.actable.options.first
        patch :update, params: {
          course_id: course.id, id: attempt.id, format: :json,
          submission: { answers: [id: answer.id, option_ids: [option.id]] }
        }
        expect(response).to have_http_status(:ok)
        expect(answer.reload.actable.options).to include(option)
      end

      it 'finalises the attempt via the platform update path (finalise= alias)' do
        patch :update, params: { course_id: course.id, id: attempt.id, format: :json,
                                 submission: { finalise: true } }
        expect(response).to have_http_status(:ok)
        expect(attempt.reload).to be_submitted
      end

      it 'drops the Submission-only EXP param the grader UI sends instead of crashing' do
        # mark/publish payloads include draft_points_awarded; the parent UpdateService would permit it →
        # UnknownAttributeError on an Attempt (no such column). The subclass drops it while mark fires.
        # See the POST #reset note above: finalise! alone doesn't persist workflow_state; the mark
        # event the controller triggers next needs it committed, since it re-`find`s the attempt.
        attempt.finalise!
        attempt.save!
        patch :update, params: { course_id: course.id, id: attempt.id, format: :json,
                                 submission: { mark: true, draft_points_awarded: 100 } }
        expect(response).to have_http_status(:ok)
        expect(attempt.reload).to be_graded
      end

      context 'when the requester is a different manager (not the creator)' do
        before { controller_sign_in(controller, other_manager) }
        it 'is denied' do
          expect do
            patch :update, params: { course_id: course.id, id: attempt.id, format: :json,
                                     submission: { finalise: true } }
          end.to raise_exception(CanCan::AccessDenied)
        end
      end
    end
  end
end
