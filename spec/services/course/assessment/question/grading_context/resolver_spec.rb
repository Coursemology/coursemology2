# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Question::GradingContext::Resolver do
  let(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:assessment) { create(:assessment) }
    let(:consumer_question) { create(:course_assessment_question_text_response, assessment: assessment) }
    let(:sibling_question) { create(:course_assessment_question_text_response, assessment: assessment) }
    let(:submission) { create(:submission, assessment: assessment) }
    let!(:sibling_answer) do
      create(:course_assessment_answer_text_response,
             question: sibling_question.acting_as, submission: submission,
             current_answer: true, answer_text: 'Sibling response body')
    end
    let!(:context) do
      Course::Assessment::Question::GradingContext.create!(
        question: consumer_question.acting_as,
        context_type: 'sibling_question_answer',
        source: sibling_question.acting_as,
        identifier: 'parent_answer'
      )
    end

    subject(:resolved) { described_class.new(consumer_question.acting_as, submission).resolve }

    it 'assembles the sibling answer, labelled by its identifier' do
      expect(resolved).to include('[parent_answer]')
      expect(resolved).to include('Sibling response body')
    end

    it 'skips a sibling with no current answer (empty context)' do
      sibling_answer.update!(current_answer: false)

      expect(resolved).to eq('')
    end
  end
end
