# frozen_string_literal: true
class Course::Assessment::Question::TextResponseComprehensionPoint < ApplicationRecord
  self.table_name = 'course_assessment_question_text_response_compre_points'

  validate :validate_point_grade

  has_many :solutions, class_name: Course::Assessment::Question::TextResponseComprehensionSolution.name,
                       dependent: :destroy, foreign_key: :point_id, inverse_of: :point

  belongs_to :group, class_name: Course::Assessment::Question::TextResponseComprehensionGroup.name,
                     inverse_of: :points

  accepts_nested_attributes_for :solutions, allow_destroy: true

  def auto_gradable_point?
    solutions.map(&:auto_gradable_solution?).any?
  end

  def initialize_duplicate(duplicator, other)
    self.group = duplicator.duplicate(other.group)
    self.solutions = duplicator.duplicate(other.solutions)
  end

  private

  def validate_point_grade
    errors.add(:point_grade, :invalid_point_grade) if point_grade > group.maximum_group_grade
  end
end
