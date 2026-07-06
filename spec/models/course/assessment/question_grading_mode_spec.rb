# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Question, type: :model do
  let(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:assessment) { create(:assessment, course: course) }

    describe 'grading_mode' do
      it 'defaults a rubric-based-response question to rubric on create' do
        question = create(:course_assessment_question_rubric_based_response, assessment: assessment)
        expect(question.acting_as.grading_mode).to eq('rubric')
        expect(question.acting_as.supported_grading_modes).to eq(['rubric'])
      end

      it 'defaults a forum-post question to default, and supports both modes' do
        question = create(:course_assessment_question_forum_post_response, assessment: assessment)
        expect(question.acting_as.grading_mode).to eq('default')
        expect(question.acting_as.supported_grading_modes).to eq(%w[default rubric])
      end

      it 'defaults other question types to default with a single supported mode' do
        question = create(:course_assessment_question_multiple_response, assessment: assessment)
        expect(question.acting_as.grading_mode).to eq('default')
        expect(question.acting_as.supported_grading_modes).to eq(['default'])
      end

      it 'rejects an unsupported grading mode' do
        question = create(:course_assessment_question_multiple_response, assessment: assessment)
        question.acting_as.grading_mode = 'rubric'
        expect(question.acting_as).not_to be_valid
        expect(question.acting_as.errors[:grading_mode]).to be_present
      end

      it 'requires a present, valid active rubric when a forum post is set to rubric grading' do
        question = create(:course_assessment_question_forum_post_response, assessment: assessment)
        question.acting_as.grading_mode = 'rubric'

        expect(question).not_to be_valid
        expect(question.errors[:active_rubric]).to be_present

        rubric = create(:course_rubric, course: course).tap do |r|
          r.question_rubrics.create!(question: question.acting_as)
        end
        question.acting_as.update_column(:active_rubric_id, rubric.id)
        expect(question.reload).to be_valid
      end
    end
  end
end
