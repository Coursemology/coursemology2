# frozen_string_literal: true
class Course::Assessment::Question::TextInputGroup < ActiveRecord::Base
  validate :validate_group_grade

  has_many :points, class_name: Course::Assessment::Question::TextInputPoint.name,
                    dependent: :destroy, foreign_key: :group_id, inverse_of: :group

  accepts_nested_attributes_for :points, allow_destroy: true

  belongs_to :question, class_name: Course::Assessment::Question::TextInput.name,
                        inverse_of: :groups

  def auto_gradable_group?
    points.map(&:auto_gradable_point?).any?
  end

  def initialize_duplicate(duplicator, other)
    self.question = duplicator.duplicate(other.question)
    self.points = duplicator.duplicate(other.points)
  end

  private

  def validate_group_grade
    errors.add(:maximum_group_grade, :invalid_group_grade) if maximum_group_grade > question.maximum_grade
  end
end
