# frozen_string_literal: true
class Course::LearningRateRecord < ApplicationRecord
  validates :learning_rate, presence: true, numericality: { greater_than_or_equal_to: 0 }
  validates :effective_min, presence: true, numericality: { greater_than_or_equal_to: 0 }
  validates :effective_max, presence: true, numericality: { greater_than_or_equal_to: 0 }
  validates :course_user, presence: true
  validate :learning_rate_between_effective_min_and_max

  belongs_to :course_user, inverse_of: :learning_rate_records

  # Newest learning rates first
  default_scope { order(created_at: :desc) }

  # Implicitly asserts that effective_min <= effective_max as well
  def learning_rate_between_effective_min_and_max # rubocop:disable Metrics/AbcSize, Metrics/CyclomaticComplexity
    # We return if any of the three attributes is nil, since that will be handled by the presence check
    return if learning_rate.nil? || effective_min.nil? || effective_max.nil?
    return if effective_min <= learning_rate && learning_rate <= effective_max

    errors.add(:learning_rate, :less_than_min) unless learning_rate >= effective_min
    errors.add(:learning_rate, :greater_than_max) unless learning_rate <= effective_max
  end
end
