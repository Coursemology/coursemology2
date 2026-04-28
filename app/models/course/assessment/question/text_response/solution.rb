# frozen_string_literal: true
class Course::Assessment::Question::TextResponse::Solution < ApplicationRecord
  enum :solution_type, [:exact_match, :keyword, :spreadsheet_formula]

  before_validation :strip_whitespace
  before_save :sanitize_explanation
  validate :validate_grade
  validates :solution_type, presence: true
  validates :solution, presence: true
  validates :grade, numericality: { greater_than: -1000, less_than: 1000 }, presence: true
  validates :question, presence: true

  belongs_to :question, class_name: 'Course::Assessment::Question::TextResponse',
                        inverse_of: :solutions
  has_many :test_spreadsheets, class_name: 'Course::Assessment::Question::TextResponse::Solution::Spreadsheet',
                        inverse_of: :solution, dependent: :destroy, autosave: true

  accepts_nested_attributes_for :test_spreadsheets, allow_destroy: true

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
    self.explanation = ApplicationController.helpers.sanitize_ckeditor_rich_text(explanation)
  end
end
