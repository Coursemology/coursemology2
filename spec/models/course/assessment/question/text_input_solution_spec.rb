# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Question::TextInputSolution, type: :model do
  it 'belongs to point' do
    expect(subject).to belong_to(:point).
      class_name(Course::Assessment::Question::TextInputPoint.name)
  end

  let(:instance) { Instance.default }
  with_tenant(:instance) do
    describe '#auto_gradable_solution?' do
      subject { build_stubbed(:course_assessment_question_text_input_solution) }
      it 'returns true' do
        expect(subject.auto_gradable_solution?).to be(true)
      end
    end

    describe 'validations' do
      describe '#answer_text' do
        subject do
          build_stubbed(:course_assessment_question_text_input_solution, \
                          solution: ['  content  '], solution_lemma: ['  content  '])
        end

        it 'strips whitespaces when validated' do
          expect(subject.valid?).to be(true)
          expect(subject.solution).to eq(['content'])
          expect(subject.solution_lemma).to eq(['content'])
        end
      end

      describe '#grade' do
        subject { build_stubbed(:course_assessment_question_text_input_solution, grade: 5) }

        it 'validates that solution grade does not exceed maximum grade of the point' do
          subject.point.maximum_point_grade = 2

          expect(subject.valid?).to be(false)
          expect(subject.errors[:grade]).to include(I18n.t('activerecord.errors.models.' \
              'course/assessment/question/text_input_solution.attributes.' \
              'grade.invalid_solution_grade'))
        end
      end

      describe '#grade_compre_lifted_word' do
        subject do
          build_stubbed(:course_assessment_question_text_input_solution, grade: 1, \
                          solution_type: :compre_lifted_word)
        end

        it 'validates that solution grade of comprehension lifted word must be 0' do
          subject.point.maximum_point_grade = 2

          expect(subject.valid?).to be(false)
          expect(subject.errors[:grade]).to include(I18n.t('activerecord.errors.models.' \
              'course/assessment/question/text_input_solution.attributes.' \
              'grade.invalid_solution_grade_compre_lifted_word'))
        end
      end
    end
  end
end
