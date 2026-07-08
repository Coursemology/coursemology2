# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Question::MockAnswer do
  let(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:assessment) { create(:assessment) }
    let(:question) do
      create(:course_assessment_question_forum_post_response, assessment: assessment).acting_as
    end
    let(:grading_context) do
      Course::Assessment::Question::GradingContext.create!(
        question: question, context_type: 'forum_thread', identifier: 'thread_root'
      )
    end

    describe '#grading_context_prompt' do
      it 'assembles author-supplied content labelled by each context identifier (via nested attributes)' do
        mock_answer = question.mock_answers.create!(
          answer_text: 'Sample',
          grading_contexts_attributes: [grading_context_id: grading_context.id, content: 'The opening post']
        )

        expect(mock_answer.grading_context_prompt).to eq("[thread_root]\nThe opening post")
      end

      it 'skips blank content' do
        mock_answer = question.mock_answers.create!(
          answer_text: 'Sample',
          grading_contexts_attributes: [grading_context_id: grading_context.id, content: '']
        )

        expect(mock_answer.grading_context_prompt).to eq('')
      end
    end
  end
end
