# frozen_string_literal: true
class Course::Assessment::Question::MockAnswer < ApplicationRecord
  validates :question, presence: true

  belongs_to :question, inverse_of: :mock_answers
  has_many :rubric_evaluations, class_name: 'Course::Rubric::MockAnswerEvaluation',
                                dependent: :destroy, inverse_of: :mock_answer
  # Author-supplied grading context content for this mock answer (one row per linked question context).
  has_many :grading_contexts, class_name: 'Course::Assessment::Question::MockAnswer::GradingContext',
                              dependent: :destroy, foreign_key: :mock_answer_id, inverse_of: :mock_answer

  accepts_nested_attributes_for :grading_contexts, allow_destroy: true

  # Assembles this mock answer's context blocks (labelled by each linked context's identifier) for the LLM
  # prompt, mirroring Course::Assessment::Question::GradingContext::Resolver for real submissions. Blank
  # content is skipped; no contexts => '' (prompt unchanged).
  def grading_context_prompt
    grading_contexts.includes(:grading_context).filter_map do |mock_context|
      next if mock_context.content.blank?

      "[#{mock_context.identifier}]\n#{mock_context.content}"
    end.join("\n\n")
  end
end
