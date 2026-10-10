# frozen_string_literal: true
#
# Manual rubric grading for answers to rubric-graded questions (+grading_mode+ 'rubric'): the grader's
# criterion selections are written to the answer's v2 grading evaluation, which must exist before the grader
# can edit them.
#
# Included by every answer type whose question supports the 'rubric' grading mode (see
# Course::Assessment::Question#supported_grading_modes). Everything here is gated on the question's grading
# mode, so an answer to a question in another mode is unaffected.
#
# NOTE: the selections are persisted after the specific answer saves, not the base answer: acts_as only saves
# the base answer when it has changes, and a selection-only edit leaves it unchanged.
module Course::Assessment::Answer::RubricGradingConcern
  extend ActiveSupport::Concern

  included do
    # Grade-selection edits target the v2 grading evaluation, which is not a nested attribute on this
    # record, so they are stashed during #assign_params and persisted once the answer itself saves.
    after_save :persist_grading_selections, if: -> { @pending_grading_selections.present? }
  end

  # Ensures the answer has a v2 grading evaluation so a grader can edit category selections (and so the
  # breakdown persists) even before any auto-grading has run. Creates a blank one -- a null-criterion
  # selection per active-rubric category, i.e. every category starts ungraded. No-op when one already
  # exists, or the question is not rubric-graded or has no active rubric. Uses #exists? so the
  # +grading_rubric_evaluation+ has_one is never cached as nil before the record is created.
  #
  # The grading evaluation's +rubric_id+ is left NULL here: an evaluation created this way is graded by hand
  # without AI prefill ("manually graded"). Auto-grading / applying from the playground set rubric_id to
  # record which rubric the grade was evaluated against. The selections still belong to the active rubric's
  # categories, so the breakdown displays against it.
  def ensure_grading_evaluation!
    return unless question.grading_mode_rubric?

    existing = acting_as.rubric_evaluations.find_by(evaluation_type: :grading)
    return existing if existing

    rubric = question.active_rubric
    return unless rubric

    Course::Rubric::AnswerEvaluation.transaction do
      grading = Course::Rubric::AnswerEvaluation.create!(
        answer: acting_as, rubric: nil, evaluation_type: :grading
      )
      rubric.categories.each { |category| grading.selections.create!(category_id: category.id) }
      grading
    end
  end

  private

  # Called from the including model's #assign_params.
  def assign_grading_selections(params)
    return unless question.grading_mode_rubric?

    @pending_grading_selections = params[:selections_attributes]
  end

  # Applies stashed grade-selection edits to the answer's grading evaluation (v2). Each row carries the
  # grading selection's id and the chosen criterion (blank clears it, i.e. ungrades the category).
  def persist_grading_selections
    grading = acting_as.grading_rubric_evaluation
    if grading
      selections_by_id = grading.selections.index_by(&:id)
      @pending_grading_selections.each do |attribute|
        selection = selections_by_id[attribute[:id].to_i]
        selection&.update!(criterion_id: attribute[:criterion_id].presence&.to_i)
      end
    end
    @pending_grading_selections = nil
  end
end
