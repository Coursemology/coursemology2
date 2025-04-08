# frozen_string_literal: true
class Course::Assessment::Question::RubricBasedResponseCriterion < ApplicationRecord
  validates :grade, numericality: { greater_than_or_equal_to: 0, only_integer: true }, presence: true
  validates :category, presence: true

  belongs_to :category,
             class_name: 'Course::Assessment::Question::RubricBasedResponseCategory',
             inverse_of: :criterions

  has_many :selections,
           class_name: 'Course::Assessment::Answer::RubricBasedResponseSelection',
           foreign_key: :criterion_id, inverse_of: :criterion, dependent: :nullify

  default_scope { order(grade: :asc) }

  def initialize_duplicate(duplicator, other)
    self.category = duplicator.duplicate(other.category)
  end
end
