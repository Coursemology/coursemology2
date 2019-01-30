# frozen_string_literal: true
class Course::Assessment::Question::TextResponseSolution < ApplicationRecord
  enum solution_type: [:exact_match, :keyword]

  before_validation :strip_whitespace
  before_save :sanitize_explanation
  validate :validate_grade
  validates :solution_type, presence: true
  validates :solution, presence: true
  validates :grade, numericality: { greater_than: -1000, less_than: 1000 }, presence: true
  validates :question, presence: true

  belongs_to :question, class_name: Course::Assessment::Question::TextResponse.name,
                        inverse_of: :solutions

  def initialize_duplicate(duplicator, other)
    self.question = duplicator.duplicate(other.question)
  end

  private

  def strip_whitespace
    solution&.strip!
  end

  def validate_grade
    errors.add(:grade, :invalid_grade) if grade > question.maximum_grade
  end

  def sanitize_explanation
    self.explanation = ApplicationController.helpers.format_html(explanation)
  end
end
