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

  let(:instance) { Instance.default }
  with_tenant(:instance) do
    describe '#auto_gradable?' do
      subject { create(:course_assessment_question_multiple_response) }
      it 'returns true' do
        expect(subject.auto_gradable?).to be(true)
      end
    end

    describe '#attempt' do
      let(:course) { create(:course) }
      let(:student_user) { create(:course_student, course: course).user }
      let(:assessment) { create(:assessment, course: course) }
      let(:question) do
        create(:course_assessment_question_multiple_response, assessment: assessment)
      end
      let(:submission) { create(:submission, assessment: assessment, creator: student_user) }
      subject { question }

      it 'returns an Answer' do
        expect(subject.attempt(submission)).to be_a(Course::Assessment::Answer)
      end

      context 'when last_attempt is given' do
        let(:last_attempt) do
          build(:course_assessment_answer_multiple_response, :with_one_correct_option,
                question: question.question)
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
