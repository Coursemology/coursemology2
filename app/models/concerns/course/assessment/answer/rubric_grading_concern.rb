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
    validate :validate_grading_selections, if: -> { @pending_grading_selections.present? }
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

  # Resolves stashed grade-selection edits against the answer's grading evaluation (v2). Each row carries the
  # grading selection's id and the chosen criterion (blank clears it, i.e. ungrades the category). Rows for
  # selections not on the grading evaluation are dropped. The criterion is looked up among the selection's
  # own category's criteria (nil when it is not one of them): neither the association nor the schema ties a
  # selection's criterion to its category.
  def resolved_grading_selections
    @resolved_grading_selections ||= begin
      grading = acting_as.grading_rubric_evaluation
      selections_by_id = grading ? grading.selections.includes(category: :criterions).index_by(&:id) : {}
      @pending_grading_selections.filter_map do |attribute|
        selection = selections_by_id[attribute[:id].to_i]
        next unless selection

        criterion_id = attribute[:criterion_id].presence&.to_i
        criterion = criterion_id && selection.category.criterions.find { |c| c.id == criterion_id }
        { selection: selection, criterion_id: criterion_id, criterion: criterion }
      end
    end
  end

  def validate_grading_selections
    # Deliberately generic and untranslated: a criterion outside its category is only reachable by a crafted
    # request. On :base, as not every including model has a +selections+ attribute to read for the message.
    errors.add(:base, 'Invalid criterion') if resolved_grading_selections.any? { |row| foreign_criterion?(row) }
  end

  def persist_grading_selections
    resolved_grading_selections.each do |row|
      # Rejected by validation; also skipped here in case validation was bypassed.
      next if foreign_criterion?(row)

      row[:selection].update!(criterion: row[:criterion])
    end
    @pending_grading_selections = nil
    @resolved_grading_selections = nil
  end

  def foreign_criterion?(row)
    row[:criterion_id] && !row[:criterion]
  end
end
