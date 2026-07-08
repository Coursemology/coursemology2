# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Rubric::AnswerEvaluation, type: :model do
  let(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:user) { create(:user) }
    let(:course) { create(:course, creator: user) }
    let(:assessment) { create(:assessment, :published_with_rubric_question, course: course) }
    let(:question) { assessment.questions.first.specific }
    let!(:rubric) { Course::Rubric.build_from_v1(question, course).tap(&:save!) }
    let(:submission) { create(:submission, :submitted, assessment: assessment, creator: user) }
    let(:answer) do
      create(:course_assessment_answer_rubric_based_response, :submitted,
             question: question.acting_as, submission: submission).answer
    end

    describe '.find_or_build_playground' do
      it 'builds a new playground evaluation when none exists' do
        evaluation = described_class.find_or_build_playground(answer: answer, rubric: rubric)

        expect(evaluation).to be_new_record
        expect(evaluation).to be_playground
      end

      it 'reuses and un-hides a dismissed (playground_hidden) evaluation' do
        hidden = described_class.create!(answer: answer, rubric: rubric, evaluation_type: :playground_hidden)

        evaluation = described_class.find_or_build_playground(answer: answer, rubric: rubric)

        expect(evaluation).to eq(hidden)
        expect(evaluation.evaluation_type).to eq('playground')
      end
    end

    describe 'playground/playground_hidden uniqueness' do
      it 'forbids a second playground-kind evaluation for the same (answer, rubric)' do
        described_class.create!(answer: answer, rubric: rubric, evaluation_type: :playground)
        duplicate = described_class.new(answer: answer, rubric: rubric, evaluation_type: :playground_hidden)

        expect(duplicate).not_to be_valid
      end
    end
  end
end
