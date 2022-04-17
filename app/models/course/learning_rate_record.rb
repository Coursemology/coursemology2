# frozen_string_literal: true
class Course::LearningRateRecord < ApplicationRecord
  validates :learning_rate, presence: true, numericality: true
  validates :effective_min, presence: true, numericality: true
  validates :effective_max, presence: true, numericality: true
  validates :course_user, presence: true
  validate :learning_rate_between_effective_min_and_max

  belongs_to :course_user, inverse_of: :learning_rate_records

  # Newest learning rates first
  default_scope { order(:created_at, :desc) }

  def learning_rate_between_effective_min_and_max
    return if effective_min <= learning_rate && learning_rate <= effective_max

    errors.add(:learning_rate, 'is not >= effective_min') unless learning_rate >= effective_min
    errors.add(:learning_rate, 'is not <= effective_max') unless learning_rate <= effective_max
  end
end
