require 'rails_helper'

RSpec.describe Course::Assessment::Question::MultipleResponse do
  it { is_expected.to act_as(:question) }
  it 'has many options' do
    expect(subject).to have_many(:options).
      class_name(Course::Assessment::Question::MultipleResponseOption.name).
      dependent(:destroy)
  end
  it { is_expected.to accept_nested_attributes_for(:options) }

  let(:instance) { create(:instance) }
  with_tenant(:instance) do
    describe '#auto_gradable?' do
      subject { build_stubbed(:course_assessment_question_multiple_response) }
      it 'returns true' do
        expect(subject.auto_gradable?).to be(true)
      end
    end

    describe '#attempt' do
      subject { build_stubbed(:course_assessment_question_multiple_response) }
      let(:assessment) { subject.assessment }
      let(:submission) { build_stubbed(:course_assessment_submission, assessment: assessment) }

      it 'returns an Answer' do
        expect(subject.attempt(submission)).to be_a(Course::Assessment::Answer)
      end

      it 'associates the answer with the submission' do
        answer = subject.attempt(submission)
        expect(submission.multiple_response_answers).to include(answer.actable)
      end
    end
  end
end
