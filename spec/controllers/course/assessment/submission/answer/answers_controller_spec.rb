# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Submission::Answer::AnswersController do
  let!(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:user) { create(:user) }
    let!(:course) { create(:course, creator: user) }
    let(:submission) { create(:submission, :attempting, assessment: assessment, creator: user) }

    before { controller_sign_in(controller, user) }

    context 'when the assessment is autograded' do
      let(:assessment) { create(:assessment, :autograded, :with_mrq_question, course: course) }
      let!(:current_answer) { submission.answers.first }

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
  end
end
