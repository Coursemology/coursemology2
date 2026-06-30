# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Rubric::ApplyEvaluationsJob do
  let(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:user) { create(:user) }
    let(:course) { create(:course, creator: user) }
    let(:assessment) { create(:assessment, :published_with_rubric_question, course: course) }
    let(:question) { assessment.questions.first.specific }
    let!(:rubric) do
      Course::Rubric.build_from_v1(question, course).tap do |built|
        built.save!
        question.acting_as.update_column(:active_rubric_id, built.id)
      end
    end
    let(:submission) { create(:submission, :submitted, assessment: assessment, creator: user) }
    let(:answer) do
      create(:course_assessment_answer_rubric_based_response, :submitted,
             question: question.acting_as, submission: submission).answer
    end

    subject(:run) { described_class.perform_now(course, rubric.id, [answer.id]) }

    context 'when the answer has no evaluation for the rubric yet' do
      it 'evaluates once and writes the grading evaluation + grade' do
        run
        grading = answer.reload.grading_rubric_evaluation

        expect(grading).to be_present
        expect(grading.rubric).to eq(rubric)
        expect(grading.selections.map(&:category_id)).to match_array(rubric.categories.map(&:id))
        expect(answer.grade).to eq(grading.selections.includes(:criterion).sum { |s| s.criterion&.grade.to_i })
      end
    end

    context 'when an llm evaluation already exists' do
      let!(:llm_evaluation) do
        evaluation = Course::Rubric::AnswerEvaluation.create!(
          answer: answer, rubric: rubric, evaluation_type: :playground
        )
        rubric.categories.each do |category|
          evaluation.selections.create!(category_id: category.id,
                                        criterion_id: category.criterions.find { |c| c.grade == 2 }.id)
        end
        evaluation
      end

      it 'reuses it (no LLM re-run) and mirrors it into the grading evaluation' do
        expect_any_instance_of(Course::Rubric::LlmService).not_to receive(:evaluate)

        run
        grading = answer.reload.grading_rubric_evaluation

        expect(grading.selections.map(&:criterion_id)).to match_array(llm_evaluation.selections.map(&:criterion_id))
        expect(answer.grade).to eq(rubric.categories.count * 2)
      end
    end
  end
end
