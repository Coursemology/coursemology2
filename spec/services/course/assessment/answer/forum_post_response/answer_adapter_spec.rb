# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Answer::ForumPostResponse::AnswerAdapter do
  let(:rubric) { instance_double(Course::Rubric) }

  describe '#answer_text' do
    it 'delegates to the answer\'s grading context text (posts + response), shared with sibling context' do
      answer = instance_double(
        Course::Assessment::Answer::ForumPostResponse,
        grading_context_text: "First body\n\nMy reflection"
      )

      expect(described_class.new(answer, rubric).answer_text).
        to eq("First body\n\nMy reflection")
    end
  end
end
