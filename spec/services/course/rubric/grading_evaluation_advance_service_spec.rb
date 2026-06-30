# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Rubric::GradingEvaluationAdvanceService do
  let(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:assessment) { create(:assessment, course: course) }
    let(:question) do
      create(:course_assessment_question_rubric_based_response, assessment: assessment)
    end
    # Two v2 rubrics that share categories "Category 1"/"Category 2" by name; the new one adds "Category 3".
    let(:old_rubric) { create(:course_rubric, course: course, category_count: 2) }
    let(:new_rubric) { create(:course_rubric, course: course, category_count: 3) }
    let(:submission) { create(:submission, assessment: assessment) }
    let(:answer) do
      create(:course_assessment_answer_rubric_based_response, :submitted,
             question: question.acting_as, submission: submission).answer
    end

    # A grading evaluation against old_rubric: every category scored at grade 2 (breakdown 4), plus a
    # manual moderation of +1 baked into the stored grade (5).
    let!(:grading) do
      question.acting_as.update_column(:active_rubric_id, old_rubric.id)
      evaluation = Course::Rubric::AnswerEvaluation.create!(
        answer: answer, rubric: old_rubric, evaluation_type: :grading
      )
      old_rubric.categories.each do |category|
        evaluation.selections.create!(category_id: category.id,
                                      criterion_id: category.criterions.find { |c| c.grade == 2 }.id)
      end
      answer.update_column(:grade, 5)
      evaluation
    end

    subject(:advance) { described_class.new(question, new_rubric).advance! }

    it 'moves the selections onto the new rubric but leaves rubric_id pinned to the original' do
      advance
      expect(grading.reload.rubric).to eq(old_rubric) # immutable: flags the grade as stale until re-applied
      selection_rubric_ids = grading.selections.map { |selection| selection.category.rubric_id }.uniq
      expect(selection_rubric_ids).to eq([new_rubric.id])
    end

    it 'advances a manually-graded (null rubric_id) evaluation, keeping rubric_id null' do
      grading.update_column(:rubric_id, nil)
      advance
      expect(grading.reload.rubric_id).to be_nil
      selection_rubric_ids = grading.selections.map { |selection| selection.category.rubric_id }.uniq
      expect(selection_rubric_ids).to eq([new_rubric.id])
    end

    it 'carries existing category grades forward by name and leaves new categories ungraded' do
      advance
      selections = grading.reload.selections.includes(:category, :criterion)
      by_name = selections.to_h { |selection| [selection.category.name, selection.criterion&.grade] }

      expect(by_name).to eq('Category 1' => 2, 'Category 2' => 2, 'Category 3' => nil)
    end

    it 'recomputes the grade while preserving the manual moderation delta' do
      advance
      # new breakdown (2 + 2 + 0) + moderation (1) == 5, unchanged.
      expect(answer.reload.grade).to eq(5)
    end

    it 'does nothing for an evaluation whose selections are already on the new rubric' do
      grading.selections.destroy_all
      new_rubric.categories.each do |category|
        grading.selections.create!(category_id: category.id,
                                   criterion_id: category.criterions.find { |c| c.grade == 2 }.id)
      end
      expect { advance }.not_to(change { grading.reload.selections.map(&:id).sort })
    end
  end
end
