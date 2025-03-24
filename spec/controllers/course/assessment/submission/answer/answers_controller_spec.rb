# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Submission::Answer::AnswersController do
  let!(:instance) { Instance.default }

  with_tenant(:instance) do
    context 'when the assessment is autograded' do
      let(:user) { create(:user) }
      let!(:course) { create(:course, creator: user) }
      let(:submission) { create(:submission, :attempting, assessment: assessment, creator: user) }
      let(:assessment) { create(:assessment, :autograded, :with_mrq_question, course: course) }
      let!(:current_answer) { submission.answers.first }

      before { controller_sign_in(controller, user) }
      describe '#submit_answer' do
        subject do
          patch :submit_answer,
                as: :json,
                params: {
                  course_id: course, assessment_id: assessment, submission_id: submission, id: current_answer.id,
                  answer: { id: current_answer.id }
                }
        end

        context 'when update fails' do
          before do
            allow(current_answer).to receive(:save).and_return(false)
            allow(submission.answers).to receive(:find).and_return(current_answer)
            controller.instance_variable_set(:@submission, submission)
            subject
          end

          it { is_expected.to have_http_status(400) }
        end

        context 'when update succeeds' do
          it 'creates a new answer and grades it' do
            original_answers = submission.answers
            expect { subject }.to change { submission.answers.count }.by(1)

            last_answer = submission.reload.answers.last
            expect(original_answers).not_to include(last_answer)
            expect(last_answer.current_answer).to be_falsey
            expect(last_answer.workflow_state).to eq 'graded'
          end

          it 'leaves current_answer in the attempting state' do
            subject

            # Reload the current_answer (there's only 1 question in this assessment)
            # after running submit_answer
            current_answer = submission.reload.current_answers.first
            expect(current_answer.current_answer).to be_truthy
            expect(current_answer.workflow_state).to eq 'attempting'
          end
        end
      end
    end

    context 'when a student submits an answer' do
      let(:course) { create(:course, :enrollable) }
      let(:submitter) { create(:course_student, course: course).user }
      let(:assessment) do
        create(:assessment, :published_with_mrq_question, course: course, start_at: 1.day.from_now)
      end
      let(:submission) { create(:submission, :published, assessment: assessment, creator: submitter) }
      let(:answer) { submission.answers.first }
      let!(:submission_question) do
        create(:submission_question, :with_post, submission_id: answer.submission_id, question_id: answer.question_id)
      end

      describe '#show' do
        render_views
        subject { get :show, format: :json, params: { course_id: course, assessment_id: assessment, submission_id: submission, id: answer.id } }

        context 'when the Normal User get the question answer details for the statistics' do
          let(:user) { create(:user) }
          before { controller_sign_in(controller, user) }
          it { expect { subject }.to raise_exception(CanCan::AccessDenied) }
        end

        context 'when the submitter Student get the question answer details for the statistics' do
          before { controller_sign_in(controller, submitter) }

          it 'returns OK with right question id and answer grade being displayed' do
            expect(subject).to have_http_status(:success)
            json_result = JSON.parse(response.body)

            expect(json_result['question']['id']).to eq(answer.question.id)
            expect(json_result['grading']['grade'].to_f).to eq(answer.grade)
          end
        end

        context 'when another Course Student get the question answer details for the statistics' do
          let(:user) { create(:course_student, course: course).user }
          before { controller_sign_in(controller, user) }
          it { expect { subject }.to raise_exception(CanCan::AccessDenied) }
        end

        context 'when the Course Manager get the question answer details for the statistics' do
          let(:user) { create(:course_manager, course: course).user }
          before { controller_sign_in(controller, user) }

          it 'returns OK with right question id and answer grade being displayed' do
            expect(subject).to have_http_status(:success)
            json_result = JSON.parse(response.body)

            expect(json_result['question']['id']).to eq(answer.question.id)
            expect(json_result['grading']['grade'].to_f).to eq(answer.grade)
          end
        end

        context 'when the administrator get the question answer details for the statistics' do
          let(:administrator) { create(:administrator) }
          before { controller_sign_in(controller, administrator) }

          it 'returns OK with right question id and answer grade being displayed' do
            expect(subject).to have_http_status(:success)
            json_result = JSON.parse(response.body)

            expect(json_result['question']['id']).to eq(answer.question.id)
            expect(json_result['grading']['grade'].to_f).to eq(answer.grade)
          end
        end
      end
    end
  end
end
