# frozen_string_literal: true
class Course::Monitoring::LiveMonitoringChannel < Course::Channel
  include Course::UsersHelper

  DEFAULT_VIEW_HEARTBEATS_LIMIT = 10
  ACTIONS = { pulse: :pulse, terminate: :terminate, viewed: :viewed, watch: :watch }.freeze

  def subscribed
    monitor_id = params[:monitor_id]
    @monitor = Course::Monitoring::Monitor.find(monitor_id)
    reject unless @monitor.present? && can?(:read, @monitor)

    stream_for @monitor
  end

  class << self
    def broadcast_pulse_to(monitor, session, snapshot)
      broadcast_from monitor, :pulse, { userId: session.creator_id, snapshot: snapshot }
    end

    def broadcast_terminate(monitor, session)
      broadcast_from monitor, :terminate, session.creator_id
    end

    def broadcast_from(monitor, action, payload)
      broadcast_to monitor, { action: ACTIONS[action], payload: payload }.compact
    end
  end

  def watch
    active_snapshots = active_sessions_snapshots
    students = current_course.students.order(:phantom, :name)

    snapshots = students.to_h do |student|
      user_id = student.user_id
      [user_id, active_snapshots[user_id] || { userName: student.name }]
    end

    broadcast_watch students.map(&:user_id), snapshots, groups
  end

  def view(data)
    session_id, limit = data['session_id'], data['limit'] || DEFAULT_VIEW_HEARTBEATS_LIMIT
    return unless (session = @monitor.sessions.find(session_id))

    recent_heartbeats = (limit == -1 ? session.heartbeats : session.heartbeats.last(limit)).map do |heartbeat|
      {
        stale: heartbeat.stale,
        userAgent: heartbeat.user_agent,
        ipAddress: heartbeat.ip_address,
        generatedAt: heartbeat.generated_at,
        isValid: heartbeat.valid_heartbeat?,
        sebPayload: heartbeat.seb_payload
      }.compact
    end

    broadcast_viewed recent_heartbeats
  end

  private

  def active_sessions_snapshots
    @monitor.sessions.includes(:heartbeats, :creator).to_h do |session|
      last_heartbeat = session.heartbeats.last

      course_user = course_users_hash[session.creator_id]
      # This technically shouldn't happen, but can happen if someone is removed from
      # the course after they finish a monitored assessment.
      next [nil, nil] unless course_user

      snapshot = {
        sessionId: session.id,
        status: session.status,
        misses: session.misses,
        lastHeartbeatAt: last_heartbeat&.generated_at,
        isValid: last_heartbeat&.valid_heartbeat?,
        userName: course_user.name,
        submissionId: submission_ids_hash[session.creator_id],
        stale: last_heartbeat&.stale
      }.compact

      [session.creator_id, snapshot]
    end.compact
  end

  def groups
    current_course.groups.ordered_by_name.includes(:group_category, :course_users).map do |group|
      {
        id: group.id,
        name: group.name,
        category: group.group_category.name,
        userIds: group.course_users&.filter_map { |course_user| course_user.user_id if course_user.student? }
      }
    end
  end

  def broadcast(action, payload)
    Course::Monitoring::LiveMonitoringChannel.broadcast_from @monitor, action, payload
  end

  def broadcast_watch(users, snapshots, groups)
    broadcast :watch, {
      userIds: users,
      snapshots: snapshots,
      groups: groups,
      monitor: {
        maxIntervalMs: @monitor.max_interval_ms,
        offsetMs: @monitor.offset_ms,
        validates: @monitor.browser_authorization?,
        browserAuthorizationMethod: @monitor.browser_authorization_method
      }
    }
  end

  def broadcast_viewed(recent_heartbeats)
    broadcast :viewed, recent_heartbeats
  end

  def component
    current_component_host[:course_monitoring_component]
  end

  def course_users_hash
    @course_users_hash ||= preload_course_users_hash(current_course)
  end

  def submission_ids_hash
    @submission_ids_hash ||= @monitor.assessment.submissions.to_h do |submission|
      [submission.creator_id, submission.id]
    end
  end
end
