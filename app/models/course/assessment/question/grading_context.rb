# frozen_string_literal: true
# Links a rubric-graded "consumer" question to a source of extra material that gets injected into its LLM
# grading prompt, labelled by +identifier+. +context_type+ selects the provider that turns this row into
# prompt text (see Course::Assessment::Question::GradingContext::Provider) and decides what +source+ means:
#   sibling_question_answer -> +source+ is a sibling Course::Assessment::Question (the student's answer to it).
#   forum_thread            -> intrinsic; +source+ is null (the forum thread lives on the consumer's own answer).
class Course::Assessment::Question::GradingContext < ApplicationRecord
  CONTEXT_TYPES = %w[sibling_question_answer forum_thread].freeze

  belongs_to :question, class_name: 'Course::Assessment::Question', inverse_of: :grading_contexts
  belongs_to :source, polymorphic: true, optional: true

  validates :context_type, presence: true, inclusion: { in: CONTEXT_TYPES }
  validates :identifier, presence: true, uniqueness: { scope: :question_id }
  validate :validate_source_for_context_type

  # Runs this context's provider to produce prompt text for the given student +submission+; nil when the
  # source is missing/empty (the pipeline drops nil blocks).
  def context_text(submission)
    Course::Assessment::Question::GradingContext::Provider.for(context_type).context_text(self, submission)
  end

  private

  def validate_source_for_context_type
    case context_type
    when 'sibling_question_answer'
      errors.add(:source, :not_a_question) unless source.is_a?(Course::Assessment::Question)
    when 'forum_thread'
      errors.add(:source, :must_be_blank) if source.present?
    end
  end
end
