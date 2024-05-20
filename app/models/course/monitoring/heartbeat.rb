# frozen_string_literal: true
class Course::Monitoring::Heartbeat < ApplicationRecord
  belongs_to :session, class_name: 'Course::Monitoring::Session', inverse_of: :heartbeats

  validates :session, presence: true
  validates :user_agent, presence: true
  validates :ip_address, allow_nil: true, format: { with: Resolv::AddressRegex }
  validates :generated_at, presence: true
  validates :stale, inclusion: { in: [true, false] }

  default_scope { order(:generated_at) }

  before_save :update_session_misses

  private

  def update_session_misses
    session.update_misses_after_heartbeat_saved!(self)
  end
end
