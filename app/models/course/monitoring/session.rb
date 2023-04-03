# frozen_string_literal: true
class Course::Monitoring::Session < ApplicationRecord
  DEFAULT_MAX_SESSION_DURATION = 1.day

  enum status: { stopped: 0, listening: 1 }

  belongs_to :monitor, class_name: Course::Monitoring::Monitor.name, inverse_of: :sessions

  # `:heartbeats` are not `dependent: :destroy` for now due to performance concerns when deleting
  # a `Course::Monitoring::Session` through `Course::Assessment::Submission`.
  has_many :heartbeats, class_name: Course::Monitoring::Heartbeat.name, inverse_of: :session

  validates :monitor_id, presence: true, uniqueness: { scope: :creator_id }
  validates :status, presence: true
  validates :creator, presence: true

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
end
