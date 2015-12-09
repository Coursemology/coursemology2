require 'rails_helper'

RSpec.describe Course::Assessment::Question::TextResponseSolution, type: :model do
  it 'belongs to question' do
    expect(subject).to belong_to(:question).
      class_name(Course::Assessment::Question::TextResponse.name)
  end

  let(:instance) { create(:instance) }
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
  end
end
