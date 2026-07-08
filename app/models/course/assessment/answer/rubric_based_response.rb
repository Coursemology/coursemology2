# frozen_string_literal: true
class Course::Assessment::Answer::RubricBasedResponse < ApplicationRecord
  acts_as :answer, class_name: 'Course::Assessment::Answer'

  after_initialize :set_default
  before_validation :strip_whitespace
  # Grade-selection edits target the v2 grading evaluation, which is not a nested attribute on this
  # record, so they are stashed during #assign_params and persisted once the answer itself saves.
  after_save :persist_grading_selections, if: -> { @pending_grading_selections.present? }

  has_many :selections, class_name: 'Course::Assessment::Answer::RubricBasedResponseSelection',
                        dependent: :destroy, foreign_key: :answer_id, inverse_of: :answer

  accepts_nested_attributes_for :selections, allow_destroy: true

  # Specific implementation of Course::Assessment::Answer#reset_answer
  def reset_answer
    self.answer_text = question.actable.template_text || ''
    save
    acting_as
  end

  def assign_params(params)
    acting_as.assign_params(params)
    self.answer_text = params[:answer_text] if params[:answer_text]

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

  # Rubric based responses should be graded in a job.
  def grade_inline?
    false
  end

  def csv_download
    ApplicationController.helpers.format_rich_text_for_csv(answer_text)
  end

  def compare_answer(other_answer)
    return false unless other_answer.is_a?(Course::Assessment::Answer::RubricBasedResponse)

    answer_text == other_answer.answer_text
  end

  # Ensures the answer has a v2 grading evaluation so a grader can edit category selections (and so the
  # breakdown persists) even before any auto-grading has run. Creates a blank one -- a null-criterion
  # selection per active-rubric category, i.e. every category starts ungraded. No-op when one already
  # exists or the question has no active rubric. Uses #exists? so the +grading_rubric_evaluation+ has_one
  # is never cached as nil before the record is created.
  #
  # The grading evaluation's +rubric_id+ is left NULL here: an evaluation created this way is graded by hand
  # without AI prefill ("manually graded"). Auto-grading / applying from the playground set rubric_id to
  # record which rubric the grade was evaluated against. The selections still belong to the active rubric's
  # categories, so the breakdown displays against it.
  def ensure_grading_evaluation!
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

  def create_category_grade_instances
    answer.class.transaction do
      new_category_selections = question.specific.categories.map do |category|
        {
          answer_id: id,
          category_id: category.id,
          criterion_id: nil,
          grade: nil,
          explanation: nil
        }
      end

      selections = Course::Assessment::Answer::RubricBasedResponseSelection.insert_all(new_category_selections)
      raise ActiveRecord::Rollback if !new_category_selections.empty? && (selections.nil? || selections.rows.empty?)
    end
  end

  private

  def set_default
    self.answer_text ||= ''
  end

  def strip_whitespace
    answer_text.strip!
  end
end
