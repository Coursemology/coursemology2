# frozen_string_literal: true
class Course::Monitoring::Monitor < ApplicationRecord
  has_one :assessment, class_name: Course::Assessment.name, inverse_of: :monitor
  has_many :sessions, class_name: Course::Monitoring::Session.name, inverse_of: :monitor

  validates :enabled, inclusion: { in: [true, false] }
  validates :min_interval_ms, numericality: { only_integer: true, greater_than: 0 }
  validates :max_interval_ms, numericality: { only_integer: true, greater_than: 0 }
  validates :offset_ms, numericality: { only_integer: true, greater_than: 0 }

  validate :max_interval_greater_than_min

  def valid_seb_hash?(seb_hash_to_validate)
    seb_hash? ? seb_hash_to_validate == seb_hash : true
  end

  private

  def max_interval_greater_than_min
    return unless max_interval_ms.present? && min_interval_ms.present?

    errors.add(:max_interval_ms, :greater_than_min_interval) unless max_interval_ms > min_interval_ms
  end
end
