# frozen_string_literal: true
class Course::Assessment::Answer::RubricBasedResponse < ApplicationRecord
  acts_as :answer, class_name: 'Course::Assessment::Answer'
  include Course::Assessment::Answer::RubricGradingConcern

  after_initialize :set_default
  before_validation :strip_whitespace

  # Deprecated link to the v1 response selection model. Remains because v1 tables will not be removed.
  # Replaced by an indirect link via Answer -> Rubric::AnswerEvaluation -> Rubric::AnswerEvaluation::Selection
  has_many :selections, class_name: 'Course::Assessment::Answer::RubricBasedResponseSelection',
                        dependent: :destroy, foreign_key: :answer_id, inverse_of: :answer

  # Specific implementation of Course::Assessment::Answer#reset_answer
  def reset_answer
    self.answer_text = question.actable.template_text || ''
    save
    acting_as
  end

  def grading_context_text
    answer_text
  end

  def assign_params(params)
    acting_as.assign_params(params)
    self.answer_text = params[:answer_text] if params[:answer_text]

    assign_grading_selections(params)
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

  private

  def set_default
    self.answer_text ||= ''
  end

  def strip_whitespace
    answer_text.strip!
  end
end
