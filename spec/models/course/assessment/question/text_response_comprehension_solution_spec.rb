# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Question::TextResponseComprehensionSolution, type: :model do
  it 'belongs to point' do
    expect(subject).to belong_to(:point).
      class_name(Course::Assessment::Question::TextResponseComprehensionPoint.name)
  end

  let(:instance) { Instance.default }
  with_tenant(:instance) do
    describe '#auto_gradable_solution?' do
      subject { build_stubbed(:course_assessment_question_text_response_comprehension_solution) }
      it 'returns true' do
        expect(subject.auto_gradable_solution?).to be(true)
      end
    end

    describe 'validations' do
      describe '#answer_text' do
        subject do
          build_stubbed(:course_assessment_question_text_response_comprehension_solution, \
                        solution: ['  content  '], solution_lemma: ['  content  '])
        end

        it 'strips whitespaces when validated' do
          expect(subject.valid?).to be(true)
          expect(subject.solution).to eq(['content'])
          expect(subject.solution_lemma).to eq(['content'])
        end
      end

      describe '#solution_lemma' do
        subject do
          build_stubbed(:course_assessment_question_text_response_comprehension_solution, \
                        solution_lemma: [])
        end

        it 'validates that solution_lemma is not empty' do
          expect(subject.valid?).to be(false)
          expect(subject.errors[:solution_lemma]).to include(I18n.t('activerecord.errors.models.' \
              'course/assessment/question/text_response_comprehension_solution.attributes.' \
              'solution_lemma.solution_lemma_empty'))
        end
      end
    end
  end
end
