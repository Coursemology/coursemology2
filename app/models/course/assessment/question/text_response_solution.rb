# frozen_string_literal: true
class Course::Assessment::Question::TextResponseSolution < ApplicationRecord
  enum :solution_type, [:exact_match, :keyword, :regex, :spreadsheet_formula]

  before_validation :strip_whitespace
  before_save :sanitize_explanation
  validate :validate_grade
  validates :solution_type, presence: true
  validates :solution, presence: true
  validates :grade, numericality: { greater_than: -1000, less_than: 1000 }, presence: true
  validates :question, presence: true

  belongs_to :question, class_name: 'Course::Assessment::Question::TextResponse',
                        inverse_of: :solutions
  has_one :test_spreadsheet, class_name: 'Course::Assessment::Question::TextResponseSolutionSpreadsheet',
                             inverse_of: :solution, dependent: :destroy, autosave: true
  accepts_nested_attributes_for :test_spreadsheet, allow_destroy: true

  def test_spreadsheet_attributes=(attributes)
    if ActiveRecord::Type::Boolean.new.cast(attributes[:_destroy])
      test_spreadsheet&.mark_for_destruction
    else
      spreadsheet = test_spreadsheet || build_test_spreadsheet
      spreadsheet.assign_params(attributes)
    end
  end

  def initialize_duplicate(duplicator, other)
    self.question = duplicator.duplicate(other.question)
    return unless other.test_spreadsheet && other.spreadsheet_formula?

    self.test_spreadsheet = duplicator.duplicate(other.test_spreadsheet)
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
