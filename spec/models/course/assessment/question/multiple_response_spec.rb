# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Question::MultipleResponse do
  it { is_expected.to act_as(Course::Assessment::Question) }
  it 'has many options' do
    expect(subject).to have_many(:options).
      class_name(Course::Assessment::Question::MultipleResponseOption.name).
      dependent(:destroy)
  end
  it { is_expected.to accept_nested_attributes_for(:options) }

  let(:instance) { create(:instance) }
  with_tenant(:instance) do
    describe '#auto_gradable?' do
      subject { create(:course_assessment_question_multiple_response) }
      it 'returns true' do
        expect(subject.auto_gradable?).to be(true)
      end
    end

    describe '#attempt' do
      subject { create(:course_assessment_question_multiple_response) }
      let(:assessment) { subject.assessment }
      let(:submission) { create(:course_assessment_submission, assessment: assessment) }

      it 'returns an Answer' do
        expect(subject.attempt(submission)).to be_a(Course::Assessment::Answer)
      end

      it 'associates the answer with the submission' do
        answer = subject.attempt(submission)
        expect(submission.multiple_response_answers).to include(answer.actable)
      end

      context 'when last_attempt is given' do
        let(:last_attempt) do
          create(:course_assessment_answer_multiple_response,
                 :with_one_correct_option,
                 question: subject.question, submission: submission)
        end

        it 'builds a new answer with old options' do
          answer = subject.attempt(submission, last_attempt).actable
          answer.save!

          expect(last_attempt.option_ids).
            to contain_exactly(*answer.answer_options.map(&:option_id))
        end
      end
    end
  end
end
