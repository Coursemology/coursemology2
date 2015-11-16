require 'rails_helper'

RSpec.describe Course::Assessment::Submission::AutoGradingService do
  let(:instance) { create(:instance) }
  with_tenant(:instance) do
    let(:answer) { create(:course_assessment_answer_multiple_response, :submitted).answer }
    let(:submission) { answer.submission.tap { |submission| submission.answers.reload } }
    let(:question) { answer.question.specific }

    describe '#grade' do
      it 'grades all answers' do
        expect(subject.grade(submission)).to eq(true)

        gradable_answers = submission.answers.select { |answer| answer.question.auto_gradable? }
        expect(gradable_answers.map(&:reload).all?(&:graded?)).to be(true)
      end
    end
  end
end
