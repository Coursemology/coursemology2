# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Question::TextResponseSolution, type: :model do
  it 'belongs to point' do
    expect(subject).to belong_to(:point).
      class_name(Course::Assessment::Question::TextResponsePoint.name)
  end

  let(:instance) { Instance.default }
  with_tenant(:instance) do
    describe '#auto_gradable_solution?' do
      subject { build_stubbed(:course_assessment_question_text_response_solution) }
      it 'returns true' do
        expect(subject.auto_gradable_solution?).to be(true)
      end
    end

    describe 'validations' do
      describe '#answer_text' do
        subject do
          build_stubbed(:course_assessment_question_text_response_solution, \
                        solution: ['  content  '])
        end

        it 'strips whitespaces when validated' do
          expect(subject.valid?).to be(true)
          expect(subject.solution).to eq(['content'])
        end
      end

      describe '#answer_text_compre_lifted_word' do
        subject do
          build_stubbed(:course_assessment_question_text_response_solution, \
                        solution: ['  content  '], solution_lemma: ['  content  '], \
                        solution_type: :compre_lifted_word)
        end

        it 'strips whitespaces when validated' do
          expect(subject.valid?).to be(true)
          expect(subject.solution).to eq(['content'])
          expect(subject.solution_lemma).to eq(['content'])
        end
      end

      describe '#answer_text_compre_keyword' do
        subject do
          build_stubbed(:course_assessment_question_text_response_solution, \
                        solution: ['  content  '], solution_lemma: ['  content  '], \
                        solution_type: :compre_keyword)
        end

        it 'strips whitespaces when validated' do
          expect(subject.valid?).to be(true)
          expect(subject.solution).to eq(['content'])
          expect(subject.solution_lemma).to eq(['content'])
        end
      end

      describe '#grade' do
        subject { build_stubbed(:course_assessment_question_text_response_solution, grade: 5) }

        it 'validates that solution grade does not exceed maximum grade of the point' do
          subject.point.maximum_point_grade = 2

          expect(subject.valid?).to be(false)
          expect(subject.errors[:grade]).to include(I18n.t('activerecord.errors.models.' \
              'course/assessment/question/text_response_solution.attributes.' \
              'grade.invalid_solution_grade'))
        end
      end

      describe '#grade_compre_lifted_word' do
        subject do
          build_stubbed(:course_assessment_question_text_response_solution, grade: 1, \
                        solution_type: :compre_lifted_word)
        end

        it 'validates that solution grade of comprehension lifted word must be 0' do
          subject.point.maximum_point_grade = 2

          expect(subject.valid?).to be(false)
          expect(subject.errors[:grade]).to include(I18n.t('activerecord.errors.models.' \
              'course/assessment/question/text_response_solution.attributes.' \
              'grade.invalid_solution_grade_compre_lifted_word'))
        end
      end
    end

    describe '.default_scope' do
      let(:point) { create(:course_assessment_question_text_response_point) }

      it 'orders by ascending weight' do
        weights = point.solutions.pluck(:weight)
        expect(weights.length).to be > 1
        expect(weights.each_cons(2).all? { |a, b| a <= b }).to be_truthy
      end
    end
  end
end
