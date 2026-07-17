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
        expect { subject }.to change { Course::Assessment::PreviewAttempt.count }.by(1)
        body = response.parsed_body
        expect(body['id']).to be_present
        expect(body['assessmentId']).to eq(source_assessment.id)
        attempt = Course::Assessment::PreviewAttempt.find(body['id'])
        expect(attempt.creator).to eq(manager)
        expect(attempt.assessment).to eq(source_assessment)
        expect(attempt.answers).not_to be_empty
      end

      it 'resumes the existing attempt (same id), not a second row' do
        subject
        original_id = response.parsed_body['id']
        expect { post :create, params: { course_id: course.id, listing_id: listing.id, format: :json } }.
          not_to(change { Course::Assessment::PreviewAttempt.count })
        expect(response.parsed_body['id']).to eq(original_id)
      end

      it 'gives a different manager their own separate attempt on the same listing' do
        subject
        first_id = response.parsed_body['id']
        controller_sign_in(controller, other_manager)
        expect { post :create, params: { course_id: course.id, listing_id: listing.id, format: :json } }.
          to change { Course::Assessment::PreviewAttempt.count }.by(1)
        expect(response.parsed_body['id']).not_to eq(first_id)
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
        a = create(:course_assessment_preview_attempt, assessment: source_assessment, creator: manager)
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
      end

      context 'when the requester is a different manager (not the creator)' do
        before { controller_sign_in(controller, other_manager) }
        it 'is denied (proves the creator_id scoping on :read)' do
          expect { subject }.to raise_exception(CanCan::AccessDenied)
        end
      end
    end

    describe 'POST #auto_grade' do
      let(:attempt) do
        a = create(:course_assessment_preview_attempt, assessment: source_assessment, creator: manager)
        a.create_new_answers
        # Must finalise first: AutoGradingService SKIPS attempting answers (`next if attempting?`),
        # so without this an inert `grade` would still pass a "renders 200" test — the no-op trap.
        # Finalise via the ATTEMPT's own event (not `answer.finalise!` directly): Coursemology's
        # workflow persistence is deferred (lib/extensions/deferred_workflow_state_persistence) —
        # a bare `answer.finalise!` only mutates the in-memory attribute and is never written to
        # the DB without an explicit `save!` right after (see workflow_event_concern.rb:150-151).
        # `PreviewAttempt#finalise` already does this correctly via `finalise_current_answers`.
        a.finalise!
        a
      end
      subject { post :auto_grade, params: { course_id: course.id, id: attempt.id, format: :json } }

      it 'grades the attempt for the owner (answer actually transitions state)' do
        answer = attempt.current_answers.first
        expect(answer.workflow_state).to eq('submitted')
        subject
        expect(response).to have_http_status(:ok)
        expect(answer.reload.workflow_state).to eq('evaluated')
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
        a = create(:course_assessment_preview_attempt, assessment: source_assessment, creator: manager)
        a.create_new_answers
        a.finalise!
        a
      end
      subject { post :reset, params: { course_id: course.id, id: attempt.id, format: :json } }

      it 'returns the attempt to a fresh attempting state with new answers, reusing the same row' do
        original_answer_ids = attempt.current_answers.map(&:id)
        expect(attempt.reload.workflow_state).to eq('submitted')

        expect { subject }.not_to(change { Course::Assessment::PreviewAttempt.count })

        expect(response).to have_http_status(:ok)
        attempt.reload
        expect(attempt.workflow_state).to eq('attempting')
        expect(attempt.current_answers).not_to be_empty
        expect(attempt.current_answers.all?(&:attempting?)).to be(true)
        # The pre-reset answers are discarded, not resumed.
        expect(attempt.current_answers.map(&:id)).not_to match_array(original_answer_ids)
      end

      context 'when the requester is a different manager (not the creator)' do
        before { controller_sign_in(controller, other_manager) }
        it 'is denied' do
          expect { subject }.to raise_exception(CanCan::AccessDenied)
        end
      end
    end

    describe 'live feedback endpoints' do
      let(:source_assessment) { create(:assessment, :published_with_programming_question) }
      let(:attempt) do
        a = create(:course_assessment_preview_attempt, assessment: source_assessment, creator: manager)
        a.create_new_answers
        a
      end
      let(:answer) { attempt.answers.where(actable_type: 'Course::Assessment::Answer::Programming').first }
      let(:question) { answer.question }
      let!(:submission_question) do
        create(:submission_question, submission: attempt, question: question)
      end
      let!(:thread) do
        Course::Assessment::LiveFeedback::Thread.create!({
          codaveri_thread_id: SecureRandom.hex(12),
          submission_question: submission_question,
          is_active: true,
          submission_creator_id: attempt.creator_id,
          created_at: Time.zone.now
        })
      end

      it 'fetches a preview attempt live feedback chat without an assessment_id route param' do
        get :fetch_live_feedback_chat, params: { course_id: course.id, answer_id: answer.id, format: :json }

        expect(response).to have_http_status(:ok)
        expect(response.parsed_body['threadId']).to eq(thread.codaveri_thread_id)
      end

      it 'saves preview attempt live feedback without an assessment_id route param' do
        post :save_live_feedback, params: {
          course_id: course.id,
          current_thread_id: thread.codaveri_thread_id,
          content: 'Feedback from Codaveri',
          is_error: false,
          format: :json
        }

        expect(response).to have_http_status(:no_content)
        expect(thread.messages.last.content).to eq('Feedback from Codaveri')
      end
    end

    describe 'POST #create_scribing_scribble' do
      let(:source_assessment) do
        create(:assessment, :published).tap do |assessment|
          create(:course_assessment_question_scribing, assessment: assessment)
        end
      end
      let(:attempt) do
        a = create(:course_assessment_preview_attempt, assessment: source_assessment, creator: manager)
        a.create_new_answers
        a
      end
      let(:answer) { attempt.answers.where(actable_type: 'Course::Assessment::Answer::Scribing').first }

      it 'updates preview attempt scribbles without an assessment_id route param' do
        post :create_scribing_scribble, params: {
          course_id: course.id,
          id: attempt.id,
          answer_id: answer.id,
          scribble: { answer_id: answer.actable.id, content: '{"objects":[]}' },
          format: :json
        }

        expect(response).to have_http_status(:ok)
        expect(answer.actable.scribbles.last.content).to eq('{"objects":[]}')
      end
    end

    # PATCH #update goes through the REAL platform path: delegate_to_service(:update) →
    # PreviewAttempt::UpdateService. These examples are the anti-no-op proof — each asserts a
    # persisted state change, not just a 200.
    describe 'PATCH #update' do
      let(:attempt) do
        a = create(:course_assessment_preview_attempt, assessment: source_assessment, creator: manager)
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

      it 'finalises the attempt via the platform update path (finalise= alias, T4)' do
        patch :update, params: { course_id: course.id, id: attempt.id, format: :json,
                                 submission: { finalise: true } }
        expect(response).to have_http_status(:ok)
        expect(attempt.reload).to be_submitted
      end

      it 'drops the Submission-only EXP param the grader UI sends instead of crashing' do
        # mark/publish payloads include draft_points_awarded (actions/index.js:188,237); the parent
        # UpdateService would permit it → UnknownAttributeError on PreviewAttempt. The subclass's
        # update_submission_params must silently discard it while the mark transition still fires.
        attempt.finalise!
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
