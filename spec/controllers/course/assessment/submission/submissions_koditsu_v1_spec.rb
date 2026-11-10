# frozen_string_literal: true
require 'rails_helper'

# Requests that a course linked to Koditsu v1 can no longer serve are answered with 410 Gone (see
# Course::Assessment::KoditsuV1RetirementConcern); unrelated denials keep their 403.
RSpec.describe Course::Assessment::Submission::SubmissionsController, type: :controller do
  let!(:instance) { Instance.default }
  # The 410 is decided when the denial is rescued, which controller specs otherwise bypass.
  run_rescue

  with_tenant(:instance) do
    let(:course) { create(:course, koditsu_v1_workspace_id: '670040c49a72e414c8f04bd7') }
    let(:assessment) do
      create(:assessment, :published_with_mcq_question, course: course, is_koditsu_enabled: koditsu_enabled)
    end
    let(:koditsu_enabled) { true }
    let(:student) { create(:course_student, course: course) }
    let(:submission) { create(:submission, :attempting, assessment: assessment, creator: student.user) }

    def expect_retired
      expect(response).to have_http_status(:gone)
      expect(JSON.parse(response.body)['errors']).to eq(
        Course::Assessment::KoditsuV1RetirementConcern::KODITSU_V1_RETIRED_MESSAGE
      )
    end

    context 'as a student' do
      before { controller_sign_in(controller, student.user) }

      it 'refuses to start an attempt' do
        expect do
          post :create, params: { course_id: course, assessment_id: assessment }
        end.not_to change(Course::Assessment::Submission, :count)
        expect_retired
      end

      it 'refuses to open an attempt' do
        get :edit, as: :json, params: { course_id: course, assessment_id: assessment, id: submission }
        expect_retired
      end

      it 'refuses to finalise an attempt' do
        patch :update, as: :json, params: {
          course_id: course, assessment_id: assessment, id: submission, submission: { finalise: true }
        }
        expect_retired
        expect(submission.reload).to be_attempting
      end

      describe '#reload_answer' do
        let(:answer) { submission.answers.first }

        def reload_answer(**extra)
          post :reload_answer, as: :json, params: {
            course_id: course, assessment_id: assessment, id: submission, answer_id: answer.id, **extra
          }
        end

        it 'refuses to reset an answer of an attempt' do
          expect_any_instance_of(Course::Assessment::Answer).not_to receive(:reset_answer)

          reload_answer(reset_answer: true)
          expect_retired
        end

        it 'still reads the answer back' do
          reload_answer
          expect(response).to have_http_status(:ok)
        end
      end

      context 'when the attempt is overdue' do
        let(:assessment) do
          create(:assessment, :published_with_mcq_question, course: course, is_koditsu_enabled: true,
                                                            end_at: 20.minutes.ago, is_late_submission_allowed: false)
        end
        # Begun before the deadline, which has since passed.
        let(:submission) do
          create(:submission, :attempting, assessment: assessment, creator: student.user).
            tap { |s| s.update_column(:created_at, 1.hour.ago) }
        end

        it 'refuses to open it, without force-submitting the placeholder' do
          get :edit, as: :json, params: { course_id: course, assessment_id: assessment, id: submission }
          expect_retired
          expect(submission.reload).to be_attempting
        end
      end

      context 'for an assessment outside Koditsu mode' do
        let(:koditsu_enabled) { false }

        it 'starts an attempt as usual' do
          expect do
            post :create, params: { course_id: course, assessment_id: assessment }
          end.to change(Course::Assessment::Submission, :count).by(1)
          expect(response).to have_http_status(:ok)
        end
      end
    end

    context 'as a manager' do
      let(:manager) { create(:course_manager, course: course) }
      before { controller_sign_in(controller, manager.user) }

      it 'refuses to force-submit' do
        submission
        patch :force_submit_all, as: :json, params: { course_id: course, assessment_id: assessment }
        expect_retired
        expect(submission.reload).to be_attempting
      end

      it 'refuses to fetch from Koditsu' do
        expect(Course::Assessment::Submission::FetchSubmissionsFromKoditsuJob).not_to receive(:perform_later)

        patch :fetch_submissions_from_koditsu, as: :json, params: { course_id: course, assessment_id: assessment }
        expect_retired
      end
    end

    [
      ['an instance administrator, not enrolled in the course', -> { create(:instance_administrator).user }],
      ['a system administrator', -> { create(:administrator) }]
    ].each do |description, administrator|
      context "as #{description}" do
        before { controller_sign_in(controller, instance_exec(&administrator)) }

        it 'refuses to force-submit' do
          submission
          patch :force_submit_all, as: :json, params: { course_id: course, assessment_id: assessment }
          expect_retired
          expect(submission.reload).to be_attempting
        end
      end
    end

    context 'as a teaching assistant, who may never force-submit' do
      let(:teaching_assistant) { create(:course_teaching_assistant, course: course) }
      before { controller_sign_in(controller, teaching_assistant.user) }

      it 'is refused with the usual 403' do
        patch :force_submit_all, as: :json, params: { course_id: course, assessment_id: assessment }
        expect(response).to have_http_status(:forbidden)
      end
    end
  end
end

RSpec.describe Course::Assessment::Submission::Answer::AnswersController, type: :controller do
  let!(:instance) { Instance.default }
  run_rescue

  with_tenant(:instance) do
    let(:course) { create(:course, koditsu_v1_workspace_id: '670040c49a72e414c8f04bd7') }
    let(:assessment) { create(:assessment, :published_with_mcq_question, course: course, is_koditsu_enabled: true) }
    let(:student) { create(:course_student, course: course) }
    let(:submission) { create(:submission, :attempting, assessment: assessment, creator: student.user) }
    let(:answer) { submission.answers.first }

    before { controller_sign_in(controller, student.user) }

    def update_answer
      patch :update, as: :json, params: {
        course_id: course, assessment_id: assessment, submission_id: submission, id: answer.id,
        answer: { id: answer.id }
      }
    end

    it 'refuses to save an answer of an attempt with 410' do
      update_answer
      expect(response).to have_http_status(:gone)
    end

    context 'when the submission is no longer attempting' do
      let(:submission) { create(:submission, :published, assessment: assessment, creator: student.user) }

      it 'keeps the usual 403, which has nothing to do with the retirement' do
        update_answer
        expect(response).to have_http_status(:forbidden)
      end
    end
  end
end
