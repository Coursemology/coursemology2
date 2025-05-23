# frozen_string_literal: true
class Course::Assessment::Answer::RubricBasedResponse < ApplicationRecord
  acts_as :answer, class_name: 'Course::Assessment::Answer'

  after_initialize :set_default
  before_validation :strip_whitespace

  has_many :selections, class_name: 'Course::Assessment::Answer::RubricBasedResponseSelection',
                        dependent: :destroy, foreign_key: :answer_id, inverse_of: :answer

  accepts_nested_attributes_for :selections, allow_destroy: true

  # Specific implementation of Course::Assessment::Answer#reset_answer
  def reset_answer
    self.answer_text = ''
    save
    acting_as
  end

  def assign_params(params)
    acting_as.assign_params(params)
    self.answer_text = params[:answer_text] if params[:answer_text]

    assign_grade_params(params)
  end

  def assign_grade_params(params)
    params[:selections_attributes]&.each do |selection_attribute|
      selection = selections.find { |s| s.id == selection_attribute[:id].to_i }
      if selection_attribute[:criterion_id]
        selection.criterion_id = selection_attribute[:criterion_id].to_i
      else
        selection.grade = selection_attribute[:grade].to_i
      end
      selection.explanation = selection_attribute[:explanation]
    end
  end

  # Rubric based responses should be graded in a job.
  def grade_inline?
    false
  end

  def csv_download
    ActionController::Base.helpers.strip_tags(answer_text)
  end

  def compare_answer(other_answer)
    return false unless other_answer.is_a?(Course::Assessment::Answer::RubricBasedResponse)

    answer_text == other_answer.answer_text
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
