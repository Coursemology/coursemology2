# frozen_string_literal: true
# This table contains DEPRECATED columns: "ai_grading_custom_prompt" and "ai_grading_model_answer".
# In the v2 rubric structure, this data has been moved to the rubric itself (see Course::Rubric)
class Course::Assessment::Question::RubricBasedResponse < ApplicationRecord
  acts_as :question, class_name: 'Course::Assessment::Question'

  validate :validate_active_rubric

  # DEPRECATED: the v1 rubric rows. Neither read nor written -- the rubric is the question's v2 active_rubric.
  # Kept only so that destroying a question also removes any v1 rows still referencing it.
  has_many :categories, class_name: 'Course::Assessment::Question::RubricBasedResponseCategory',
                        dependent: :destroy, foreign_key: :question_id, inverse_of: :question

  def initialize_duplicate(duplicator, other)
    copy_attributes(other)

    # active_rubric now lives on the polymorphic question; the dup'd acting_as carries the source's
    # active_rubric_id over, so replace it with a duplicate of the source rubric (these accessors proxy to
    # acting_as) so the new question owns its own (immutable) v2 rubric instead of sharing the source's.
    self.active_rubric = duplicator.duplicate(other.active_rubric)
    # Link it too, as authoring does: the playground reaches a question's rubrics through the link.
    acting_as.question_rubrics.build(rubric: active_rubric) if active_rubric
    initialize_grading_context_duplicates(duplicator, other)
  end

  def auto_gradable?
    active_rubric.present? && ai_grading_enabled?
  end

  # DEPRECATED -- scheduled for removal with Course::Rubric.build_from_v1, in the deploy after the v1 rubric
  # deprecation, if no issues are raised.
  # Safety net for a legacy question that still has no v2 active rubric: builds one from its v1 rubric rows
  # (read only) and makes it active, so the question can be edited and graded. No-op when the question already
  # has an active rubric, or has no gradable v1 categories.
  def ensure_active_rubric_from_v1!(course)
    return if active_rubric

    rubric = Course::Rubric.build_from_v1(self, course)
    return if rubric.categories.empty?

    rubric.save!
    acting_as.update_column(:active_rubric_id, rubric.id)
    acting_as.active_rubric = rubric
  end

  def auto_grader
    Course::Assessment::Answer::RubricAutoGradingService.new
  end

  def rubric_answer_adapter(answer, rubric)
    Course::Assessment::Answer::RubricBasedResponse::AnswerAdapter.new(answer, rubric)
  end

  # RBR is defined by rubric grading -- it is always graded against its active rubric.
  def supported_grading_modes
    ['rubric']
  end

  # RBR answer text can feed another question's grading (as a sibling-answer context).
  def provides_grading_context?
    true
  end

  # RBR is rubric-graded, so it can pull sibling answers into its grading prompt.
  def available_grading_context_types
    ['sibling_question_answer']
  end

  def question_type
    'RubricBasedResponse'
  end

  def question_type_readable
    I18n.t('activerecord.attributes.models.course/assessment/question/rubric_based_response.rubric_based_response')
  end

  def history_viewable?
    true
  end

  def csv_downloadable?
    true
  end

  def attempt(submission, last_attempt = nil)
    answer = Course::Assessment::Answer::RubricBasedResponse.new(submission: submission, question: question)
    if last_attempt
      answer.answer_text = last_attempt.answer_text
    else
      answer.answer_text = template_text unless template_text.blank?
    end

    answer.acting_as
  end

  private

  # RBR is always rubric-graded, so it needs a valid rubric to grade against. The rubric's own validation
  # messages (category names, criterion grades, ...) are surfaced on the question, so the edit page reports
  # what to fix.
  def validate_active_rubric
    return errors.add(:active_rubric, :blank) if active_rubric.nil?
    return if active_rubric.valid?

    active_rubric.errors.each { |error| errors.add(:categories, error.message) }
  end
end
