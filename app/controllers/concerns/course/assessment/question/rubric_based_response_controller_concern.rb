# frozen_string_literal: true
module Course::Assessment::Question::RubricBasedResponseControllerConcern
  extend ActiveSupport::Concern

  def preload_criterions_per_category
    @rubric_based_response_question = Course::Assessment::Question::RubricBasedResponse.
                                      includes(categories: :criterions).
                                      find(@rubric_based_response_question.id)
  end

  # Keeps the question's v2 active_rubric in sync with its (just-saved) v1 rubric, copy-on-write: builds the
  # proposed content from the current non-bonus categories and either reuses the existing active rubric
  # (unchanged content) or persists a new version and repoints active_rubric_id at it.
  #
  # Returns:
  #   :synced           -- nothing to do, or the grading evaluations were advanced to the new version.
  #   :advance_required -- the new version is structurally INCOMPATIBLE with the previous one, there are
  #                        graded answers, and confirm_advance is false. The advance (which may null some
  #                        categories) is NOT performed; the caller should roll the whole update back, have
  #                        the user confirm, and re-submit with confirm_advance: true.
  def sync_active_rubric(confirm_advance: false)
    question = @rubric_based_response_question
    categories = Course::Rubric.categories_from_v1(question)
    return :synced if categories.empty? # no gradable categories yet; leave active_rubric_id untouched

    previous_active = question.active_rubric
    synced = build_synced_rubric(question, previous_active, categories)
    return :synced if question.active_rubric_id == synced.id # content unchanged; nothing to repoint/advance

    # active_rubric_id lives on the polymorphic question; write through acting_as (update_column is not
    # proxied by acts_as).
    question.acting_as.update_column(:active_rubric_id, synced.id)

    advance_service = Course::Rubric::GradingEvaluationAdvanceService.new(question, synced)
    if !confirm_advance && previous_active&.incompatible_with?(synced) && advance_service.pending?
      return :advance_required
    end

    advance_service.advance!
    :synced
  end

  # Caps existing answer grades at the question's maximum_grade. Needed when maximum_grade is lowered
  # without a rubric-content change (so the advance service, which also clamps, does not run).
  def clamp_answer_grades_to_maximum
    maximum_grade = @rubric_based_response_question.maximum_grade
    Course::Assessment::Answer.where(question_id: @rubric_based_response_question.acting_as.id).
      where('grade > ?', maximum_grade).
      update_all(grade: maximum_grade)
  end

  def build_synced_rubric(question, previous_active, categories)
    if previous_active
      previous_active.copy_with(grading_prompt: question.ai_grading_custom_prompt,
                                model_answer: question.ai_grading_model_answer, categories: categories)
    else
      Course::Rubric.build_from_v1(question, current_course).tap(&:save!)
    end
  end
end
