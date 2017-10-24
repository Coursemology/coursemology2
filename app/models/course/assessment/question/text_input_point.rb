# frozen_string_literal: true
class Course::Assessment::Question::TextInputPoint < ActiveRecord::Base
  validate :validate_point_grade

  has_many :solutions, class_name: Course::Assessment::Question::TextInputSolution.name,
                       dependent: :destroy, foreign_key: :point_id, inverse_of: :point

  accepts_nested_attributes_for :solutions, allow_destroy: true

  belongs_to :group, class_name: Course::Assessment::Question::TextInputGroup.name,
                     inverse_of: :points

  def auto_gradable_point?
    solutions.map(&:auto_gradable_solution?).any?
  end

  def initialize_duplicate(duplicator, other)
    self.group = duplicator.duplicate(other.group)
    self.solutions = duplicator.duplicate(other.solutions)
  end

  private

  def validate_point_grade
    errors.add(:maximum_point_grade, :invalid_point_grade) if maximum_point_grade > group.maximum_group_grade
  end
end
