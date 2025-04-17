# frozen_string_literal: true
class Course::Assessment::Question::RubricBasedResponseLevel < ApplicationRecord
  validates :level, numericality: { greater_than_or_equal_to: 0, only_integer: true }, presence: true
  validates :category, presence: true

  belongs_to :category,
             class_name: 'Course::Assessment::Question::RubricBasedResponseCategory',
             inverse_of: :levels

  default_scope { order(level: :asc) }

  def initialize_duplicate(duplicator, other)
    self.category = duplicator.duplicate(other.category)
  end
end
