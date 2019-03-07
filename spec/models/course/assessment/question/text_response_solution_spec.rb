# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Question::TextResponseSolution, type: :model do
  it 'belongs to question' do
    expect(subject).to belong_to(:question).
      class_name(Course::Assessment::Question::TextResponse.name).without_validating_presence
  end

  let(:instance) { Instance.default }
  with_tenant(:instance) do
    describe 'validations' do
      describe '#answer_text' do
        subject do
          build_stubbed(:course_assessment_question_text_response_solution, solution: '  content  ')
        end

        it 'strips whitespaces when validated' do
          expect(subject.valid?).to be(true)
          expect(subject.solution).to eq('content')
        end
      end

      describe '#grade' do
        subject { build_stubbed(:course_assessment_question_text_response_solution, grade: 20) }

        it 'validates that solution grade does not exceed maximum grade' do
          subject.question.maximum_grade = 10

          expect(subject.valid?).to be(false)
          expect(subject.errors[:grade]).to include(I18n.t('activerecord.errors.models.' \
            'course/assessment/question/text_response_solution.attributes.grade.invalid_grade'))
        end
      end
    end

    describe 'callbacks' do
      subject do
        build(:course_assessment_question_text_response_solution,
              explanation: "<script>alert('bad');</script>")
      end

      context 'when solution is saved' do
        it 'does not save <script> tags in the explanation' do
          subject.save!
          subject.reload
          expect(subject.explanation).not_to include('script')
        end
      end
    end
  end
end
