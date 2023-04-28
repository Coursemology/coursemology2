# frozen_string_literal: true
class Course::Monitoring::LiveMonitoringChannel < Course::Channel
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
    students = @course.students.order(:phantom, :name)

    snapshots = students.to_h do |student|
      user_id = student.user_id
      [user_id, active_snapshots[user_id] || { userName: student.name }]
    end

    broadcast_watch students.map(&:user_id), snapshots, groups
  end

  def view(data)
    session_id, limit = data['session_id'], data['limit'] || DEFAULT_VIEW_HEARTBEATS_LIMIT
    return unless (session = @monitor.sessions.find(session_id))

    recent_heartbeats = session.heartbeats.last(limit).map do |heartbeat|
      {
        stale: heartbeat.stale,
        userAgent: heartbeat.user_agent,
        ipAddress: heartbeat.ip_address,
        generatedAt: heartbeat.generated_at,
        isValid: @monitor.valid_secret?(heartbeat.user_agent)
      }.compact
    end

    broadcast_viewed recent_heartbeats.reverse
  end

  private

  def active_sessions_snapshots
    @monitor.sessions.includes(:heartbeats, :creator).to_h do |session|
      last_heartbeat = session.heartbeats.last
      is_valid_secret = @monitor.valid_secret?(last_heartbeat&.user_agent)

      snapshot = {
        sessionId: session.id,
        status: session.status,
        lastHeartbeatAt: last_heartbeat&.generated_at,
        isValid: is_valid_secret,
        userName: session.creator.name,
        stale: last_heartbeat&.stale
      }.compact

      [session.creator_id, snapshot]
    end
  end

  def groups
    @course.groups.ordered_by_name.includes(:group_category, :course_users).map do |group|
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
        hasSecret: @monitor.secret?
      }
    }
  end

  def broadcast_viewed(recent_heartbeats)
    broadcast :viewed, recent_heartbeats
  end

  def component
    current_component_host[:course_monitoring_component]
  end
end
