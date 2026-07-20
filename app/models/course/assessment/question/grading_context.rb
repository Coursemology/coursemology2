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

  # Duplication (see Duplicator). A context is a child of its consumer +question+ and is duplicated when that
  # question is (Course::Assessment::Question#initialize_grading_context_duplicates). Here we re-point the
  # polymorphic +source+ (a sibling question, for 'sibling_question_answer' contexts; null for 'forum_thread').
  # The consumer and source questions can be duplicated in either order, so the source linkage is formed from
  # whichever side runs later: if the source is already duplicated we point at its duplicate now; otherwise we
  # leave the copied source in place and the source question re-points us when it is duplicated (the fix-up
  # pass in that same helper).
  def initialize_duplicate(duplicator, other)
    self.question = duplicator.duplicate(other.question.actable).acting_as
    return unless other.source && duplicator.duplicated?(other.source.actable)

    self.source = duplicator.duplicate(other.source.actable).acting_as
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
