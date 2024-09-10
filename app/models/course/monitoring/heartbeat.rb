# frozen_string_literal: true
class Course::Monitoring::Heartbeat < ApplicationRecord
  belongs_to :session, class_name: 'Course::Monitoring::Session', inverse_of: :heartbeats

  validates :session, presence: true
  validates :user_agent, presence: true
  validates :ip_address, allow_nil: true, format: { with: Resolv::AddressRegex }
  validates :generated_at, presence: true
  validates :stale, inclusion: { in: [true, false] }

  validate :valid_seb_payload_if_exists

  default_scope { order(:generated_at) }

  before_save :update_session_misses

  def valid_heartbeat?
    session.monitor.valid_heartbeat?(self)
  end

  private

  SEB_PAYLOAD_SHAPE = { config_key_hash: String, url: String }.freeze

  def update_session_misses
    session.update_misses_after_heartbeat_saved!(self)
  end

  def filter_seb_payload(seb_payload)
    seb_payload.slice(*SEB_PAYLOAD_SHAPE.keys)
  end

  def valid_seb_payload?(seb_payload)
    seb_payload.with_indifferent_access.tap do |payload|
      return SEB_PAYLOAD_SHAPE.all? { |key, type| payload[key].instance_of?(type) }
    end
  end

  def valid_seb_payload_if_exists
    return if seb_payload.present? ? valid_seb_payload?(seb_payload) : true

    errors.add(:seb_payload, :invalid_seb_payload)
  end
end
