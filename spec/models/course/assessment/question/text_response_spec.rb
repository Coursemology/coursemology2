require 'rails_helper'

RSpec.describe Course::Assessment::Question::TextResponse, type: :model do
  it { is_expected.to act_as(:question) }
  it 'has many solutions' do
    expect(subject).to have_many(:solutions).
      class_name(Course::Assessment::Question::TextResponseSolution.name).
      dependent(:destroy)
  end
  it { is_expected.to accept_nested_attributes_for(:solutions) }

  let(:instance) { create(:instance) }
  with_tenant(:instance) do
    describe '#attempt' do
      subject { build_stubbed(:course_assessment_question_text_response) }
      let(:assessment) { subject.assessment }
      let(:submission) { build_stubbed(:course_assessment_submission, assessment: assessment) }

      it 'returns an Answer' do
        expect(subject.attempt(submission)).to be_a(Course::Assessment::Answer)
      end

      it 'associates the answer with the submission' do
        answer = subject.attempt(submission)
        expect(submission.text_response_answers).to include(answer.actable)
      end
    end
  end
end
