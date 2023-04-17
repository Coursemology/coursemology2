# frozen_string_literal: true
class Course::Monitoring::Monitor < ApplicationRecord
  DEFAULT_MIN_INTERVAL_MS = 3000

  has_one :assessment, class_name: Course::Assessment.name, inverse_of: :monitor
  has_many :sessions, class_name: Course::Monitoring::Session.name, inverse_of: :monitor

  validates :enabled, inclusion: { in: [true, false] }
  validates :min_interval_ms, numericality: { only_integer: true, greater_than_or_equal_to: DEFAULT_MIN_INTERVAL_MS }
  validates :max_interval_ms, numericality: { only_integer: true, greater_than: 0 }
  validates :offset_ms, numericality: { only_integer: true, greater_than: 0 }

  validate :max_interval_greater_than_min

  def valid_secret?(string)
    secret? ? (string&.include?(secret) || false) : true
  end

  private

  def max_interval_greater_than_min
    return unless max_interval_ms.present? && min_interval_ms.present?

    errors.add(:max_interval_ms, :greater_than_min_interval) unless max_interval_ms > min_interval_ms
  end
end
