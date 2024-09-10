# frozen_string_literal: true
class Course::Monitoring::Monitor < ApplicationRecord
  DEFAULT_MIN_INTERVAL_MS = 3000

  enum browser_authorization_method: { user_agent: 0, seb_config_key: 1 }

  has_one :assessment, class_name: 'Course::Assessment', inverse_of: :monitor
  has_many :sessions, class_name: 'Course::Monitoring::Session', inverse_of: :monitor

  validates :enabled, inclusion: { in: [true, false] }
  validates :min_interval_ms, numericality: { only_integer: true, greater_than_or_equal_to: DEFAULT_MIN_INTERVAL_MS }
  validates :max_interval_ms, numericality: { only_integer: true, greater_than: 0 }
  validates :offset_ms, numericality: { only_integer: true, greater_than: 0 }
  validates :blocks, inclusion: { in: [true, false] }
  validates :browser_authorization, inclusion: { in: [true, false] }
  validates :browser_authorization_method, presence: true

  validate :max_interval_greater_than_min
  validate :can_enable_only_when_password_protected
  validate :can_block_only_when_has_browser_authorization_and_session_protected
  validate :seb_config_key_required_if_using_seb_config_key_browser_authorization

  def valid_heartbeat?(heartbeat)
    validator = "Course::Monitoring::BrowserAuthorization::#{browser_authorization_method.to_s.camelize}".constantize
    validator.new(self).valid_heartbeat?(heartbeat)
  end

  # `Duplicator` already performed a shallow duplicate of the `other` monitor.
  # There's no need to duplicate `other`'s sessions and heartbeats.
  def initialize_duplicate(duplicator, other)
  end

  private

  def max_interval_greater_than_min
    return unless max_interval_ms.present? && min_interval_ms.present?

    errors.add(:max_interval_ms, :greater_than_min_interval) unless max_interval_ms > min_interval_ms
  end

  def can_enable_only_when_password_protected
    return unless enabled? && !assessment.view_password_protected?

    errors.add(:enabled, :must_be_password_protected)
  end

  def can_block_only_when_has_browser_authorization_and_session_protected
    return unless blocks? && (!browser_authorization? || !assessment.session_password_protected?)

    errors.add(:blocks, :must_have_browser_authorization_and_session_protection)
  end

  def seb_config_key_required_if_using_seb_config_key_browser_authorization
    return unless browser_authorization_method.to_sym == :seb_config_key && seb_config_key.blank?

    errors.add(:seb_config_key, :required_if_using_seb_config_key_browser_authorization)
  end
end
