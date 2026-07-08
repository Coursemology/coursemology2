# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Answer::RubricBasedResponse, type: :model do
  let(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:user) { create(:user) }
    let(:course) { create(:course, creator: user) }
    let(:assessment) { create(:assessment, :published_with_rubric_question, course: course) }
    let(:question) { assessment.questions.first.specific }
    let!(:active_rubric) do
      Course::Rubric.build_from_v1(question, course).tap do |rubric|
        rubric.save!
        question.acting_as.update_column(:active_rubric_id, rubric.id)
      end
    end
    let(:submission) { create(:submission, :submitted, assessment: assessment, creator: user) }
    let(:answer) do
      create(:course_assessment_answer_rubric_based_response, :submitted,
             question: question.acting_as, submission: submission).answer
    end
    # A grading evaluation with one (ungraded) selection per active-rubric category.
    let!(:grading) do
      evaluation = Course::Rubric::AnswerEvaluation.create!(
        answer: answer, rubric: active_rubric, evaluation_type: :grading
      )
      active_rubric.categories.each { |category| evaluation.selections.create!(category_id: category.id) }
      evaluation
    end

    describe 'manual grade-edit path (#assign_params)' do
      let(:category) { active_rubric.categories.first }
      let(:selection) { grading.selections.find_by(category_id: category.id) }
      let(:criterion) { category.criterions.find { |c| c.grade == 2 } }

      it 'applies grade-selection edits to the grading evaluation when the answer saves' do
        answer.specific.assign_params(selections_attributes: [id: selection.id, criterion_id: criterion.id])
        answer.specific.save!

        expect(selection.reload.criterion_id).to eq(criterion.id)
      end

      it 'clears the criterion (ungrades the category) when blank' do
        selection.update!(criterion_id: criterion.id)

        answer.specific.assign_params(selections_attributes: [id: selection.id, criterion_id: ''])
        answer.specific.save!

        expect(selection.reload.criterion_id).to be_nil
      end

      it 'does not touch the v1 selections table' do
        expect do
          answer.specific.assign_params(selections_attributes: [id: selection.id, criterion_id: criterion.id])
          answer.specific.save!
        end.not_to change(Course::Assessment::Answer::RubricBasedResponseSelection, :count)
      end
    end

    describe '#ensure_grading_evaluation!' do
      it 'is idempotent and returns the existing grading evaluation' do
        expect { answer.specific.ensure_grading_evaluation! }.
          not_to change(Course::Rubric::AnswerEvaluation, :count)
        expect(answer.specific.ensure_grading_evaluation!).to eq(grading)
      end

      context 'when the answer has no grading evaluation' do
        before { grading.destroy! }

        it 'creates a blank, manually-graded (null rubric) one with a selection per active-rubric category' do
          answer.specific.ensure_grading_evaluation!
          created = answer.reload.grading_rubric_evaluation

          expect(created.rubric).to be_nil # manually graded: no AI rubric recorded
          expect(created.selections.map(&:category_id)).to match_array(active_rubric.categories.map(&:id))
          expect(created.selections.map(&:criterion_id)).to all(be_nil)
        end
      end

      context 'when the question has no active rubric' do
        before do
          grading.destroy!
          question.acting_as.update_column(:active_rubric_id, nil)
        end

        it 'is a no-op' do
          expect { answer.specific.ensure_grading_evaluation! }.
            not_to change(Course::Rubric::AnswerEvaluation, :count)
          expect(answer.reload.grading_rubric_evaluation).to be_nil
        end
      end
    end
  end
end
