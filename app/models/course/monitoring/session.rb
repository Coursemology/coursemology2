# frozen_string_literal: true
class Course::Monitoring::Session < ApplicationRecord
  DEFAULT_MAX_SESSION_DURATION = 1.day

  enum :status, { stopped: 0, listening: 1 }

  belongs_to :monitor, class_name: 'Course::Monitoring::Monitor', inverse_of: :sessions

  # `:heartbeats` are not `dependent: :destroy` for now due to performance concerns when deleting
  # a `Course::Monitoring::Session` through `Course::Assessment::Submission`.
  has_many :heartbeats, class_name: 'Course::Monitoring::Heartbeat', inverse_of: :session

  validates :monitor_id, presence: true, uniqueness: { scope: :creator_id }
  validates :status, presence: true
  validates :creator, presence: true
  validates :misses, presence: true, numericality: { only_integer: true, greater_than_or_equal_to: 0 }

  def expired?
    created_at && (Time.zone.now - created_at > DEFAULT_MAX_SESSION_DURATION)
  end

  def listening?
    !expired? && super
  end

  def stopped?
    expired? || super
  end

  def status
    expired? ? :expired : super&.to_sym
  end

  def expiry
    (created_at || 0) + DEFAULT_MAX_SESSION_DURATION
  end

  def last_live_heartbeat
    heartbeats.where(stale: false).last
  end

  def update_misses_after_heartbeat_saved!(heartbeat)
    last_live_heartbeat_time = last_live_heartbeat&.generated_at
    return unless last_live_heartbeat_time && !heartbeat.stale?

    delta_from_last_heartbeat_ms = (heartbeat.generated_at - last_live_heartbeat_time).in_milliseconds
    return unless delta_from_last_heartbeat_ms > monitor.max_interval_ms + monitor.offset_ms

    update!(misses: misses + 1)
  end
end
