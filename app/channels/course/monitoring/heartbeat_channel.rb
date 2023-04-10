# frozen_string_literal: true
class Course::Monitoring::HeartbeatChannel < Course::Channel
  def subscribed
    session_id = params[:session_id]
    @session = Course::Monitoring::Session.find(session_id)
    @monitor = @session.monitor
    reject unless @session.present? && can?(:read, @session) && listening?

    stream_for @session
  end

  def pulse(data)
    @monitor.reload && @session.reload

    unless can_pulse? && listening?
      # TODO: Use `stop_stream_from @session` once in Rails 6.1+
      # In particular, use `stop_stream_from @session unless can_pulse?`
      broadcast_terminate
      broadcast_terminate_to_live_monitoring
      return
    end

    ip_address, user_agent = ip_address_and_user_agent
    timestamp = data['timestamp']

    heartbeat = Course::Monitoring::Heartbeat.new(
      session: @session,
      user_agent: user_agent,
      ip_address: ip_address,
      generated_at: time_from(timestamp),
      seb_hash: data['seb_hash']
    )

    return unless heartbeat.save

    broadcast_next timestamp
    broadcast_pulse_to_live_monitoring heartbeat
  end

  def flush(data)
    ip_address, user_agent = ip_address_and_user_agent
    heartbeats_data = filter_and_sort_heartbeats(data['heartbeats'])

    heartbeats = heartbeats_data.map do |heartbeat_data|
      {
        session_id: @session.id,
        user_agent: user_agent,
        ip_address: ip_address,
        generated_at: time_from(heartbeat_data['timestamp']),
        seb_hash: heartbeat_data['seb_hash'],
        stale: true,
        created_at: Time.zone.now,
        updated_at: Time.zone.now
      }
    end

    flushed = Course::Monitoring::Heartbeat.insert_all(heartbeats)
    broadcast_flushed heartbeats_data.first['timestamp'], heartbeats_data.last['timestamp'] if flushed
  end

  private

  def listening?
    @monitor.enabled? && @session.listening?
  end

  def filter_and_sort_heartbeats(heartbeats)
    start_time = @session.created_at
    end_time = listening? ? @session.expiry : @session.heartbeats.last&.generated_at

    heartbeats.filter { |h| time_from(h['timestamp']).between?(start_time, end_time) }.sort_by { |h| h['timestamp'] }
  end

  def time_from(milliseconds)
    Time.zone.at(0, milliseconds, :millisecond)
  end

  def broadcast_pulse_to_live_monitoring(heartbeat)
    seb_hash = heartbeat.seb_hash
    is_valid_seb_hash = @monitor.valid_seb_hash?(seb_hash)

    Course::Monitoring::LiveMonitoringChannel.pulse_to @monitor, @session, {
      sessionId: @session.id,
      status: @session.status,
      lastHeartbeatAt: heartbeat.generated_at,
      isValidSEBHash: is_valid_seb_hash,
      sebHash: (seb_hash unless is_valid_seb_hash)
    }.compact
  end

  def broadcast_terminate_to_live_monitoring
    Course::Monitoring::LiveMonitoringChannel.terminate @monitor, @session
  end

  def broadcast_terminate
    Course::Monitoring::HeartbeatChannel.broadcast_to @session, { action: :terminate }
  end

  def broadcast_flushed(first_timestamp, last_timestamp)
    Course::Monitoring::HeartbeatChannel.broadcast_to @session, {
      action: :flushed,
      from: first_timestamp,
      to: last_timestamp
    }
  end

  def broadcast_next(received_timestamp)
    next_timeout = rand(@monitor.min_interval_ms..@monitor.max_interval_ms)

    Course::Monitoring::HeartbeatChannel.broadcast_to @session, {
      action: :next,
      nextTimeout: next_timeout,
      received: received_timestamp
    }
  end

  def component
    current_component_host[:course_monitoring_component]
  end

  def can_pulse?
    @can_pulse ||= can? :create, Course::Monitoring::Heartbeat.new(session: @session)
  end
end
