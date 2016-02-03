# frozen_string_literal: true
class Course::Assessment::Question::TextResponseSolution < ActiveRecord::Base
  enum solution_type: [:exact_match, :keyword]

  before_validation :strip_whitespace
  validate :validate_grade

  belongs_to :question, class_name: Course::Assessment::Question::TextResponse.name,
                        inverse_of: :solutions

  private

  def strip_whitespace
    solution.strip! unless solution.nil?
  end

  def validate_grade
    errors.add(:grade, :invalid_grade) if grade > question.maximum_grade
  end
end
