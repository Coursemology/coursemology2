# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Answer::RubricBasedResponse::AnswerAdapter do
  let(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:assessment) { create(:assessment, :published_with_rubric_question) }
    let(:question) { assessment.questions.first.specific }
    let!(:active_rubric) do
      Course::Rubric.build_from_v1(question, assessment.course).tap do |rubric|
        rubric.save!
        question.acting_as.update_column(:active_rubric_id, rubric.id)
      end
    end
    let(:submission) { create(:submission, :attempting, assessment: assessment) }
    let(:answer) do
      create(:course_assessment_answer_rubric_based_response, :submitted,
             question: question.acting_as, submission: submission)
    end

    subject(:adapter) { described_class.new(answer, active_rubric) }

    # One graded selection (criterion of grade 2) per active-rubric category, in the LLM response shape.
    let(:category_grades) do
      active_rubric.categories.map do |category|
        criterion = category.criterions.find { |c| c.grade == 2 }
        { category_id: category.id, criterion_id: criterion.id, grade: criterion.grade, explanation: 'why' }
      end
    end
    let(:llm_response) { { 'category_grades' => category_grades, 'feedback' => 'Great work' } }

    describe '#save_llm_results' do
      it 'writes an llm and a grading evaluation against the active rubric' do
        adapter.save_llm_results(llm_response)

        llm = answer.acting_as.rubric_evaluations.playground_types.find_by(rubric: active_rubric)
        grading = answer.acting_as.grading_rubric_evaluation

        [llm, grading].each do |evaluation|
          expect(evaluation).to be_present
          expect(evaluation.feedback).to eq('Great work')
          expect(evaluation.selections.map(&:criterion_id)).
            to match_array(category_grades.map { |grade| grade[:criterion_id] })
        end
        expect(grading.rubric).to eq(active_rubric)
      end

      it 'sets the answer grade to the sum of the selected criterions (clamped to maximum)' do
        adapter.save_llm_results(llm_response)

        expected = category_grades.sum { |grade| grade[:grade] }
        expect(answer.grade).to eq([expected, question.maximum_grade].min)
      end

      it 'upserts (does not duplicate) evaluations when graded again' do
        adapter.save_llm_results(llm_response)
        expect { adapter.save_llm_results(llm_response) }.
          not_to change(Course::Rubric::AnswerEvaluation, :count)
      end
    end
  end
end
