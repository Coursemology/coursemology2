# frozen_string_literal: true
class Course::Assessment::Submission::MonitoringService
  class << self
    def for(submission, assessment)
      new(submission, assessment) if assessment.monitor_id?
    end

    def continue_listening_from(assessment, creator_ids)
      sessions_from(assessment, creator_ids)&.update_all(status: :listening)
    end

    def destroy_all_by(assessment, creator_ids)
      sessions_from(assessment, creator_ids)&.destroy_all
    end

    private

    def sessions_from(assessment, creator_ids)
      return nil unless assessment.monitor_id?

      assessment.monitor.sessions.where(creator_id: creator_ids)
    end
  end

  # Use `Course::Assessment::Submission::MonitoringService.for` for a safer initialization.
  def initialize(submission, assessment)
    @submission = submission
    @monitor = assessment.monitor
  end

  def session
    @session ||= @monitor.sessions.find_or_create_by!(creator_id: @submission.creator_id) do |session|
      session.status = :listening
    end
  end

  alias_method :create_new_session_if_not_exist!, :session

  def continue_listening!
    session.update!(status: :listening) if session.persisted?
  end

  def stop!
    return unless session.persisted?

    session.update!(status: :stopped)

    Course::Monitoring::HeartbeatChannel.broadcast_terminate session
    Course::Monitoring::LiveMonitoringChannel.broadcast_terminate @monitor, session
  end

  def listening?
    @monitor.enabled? && session.listening?
  end
end
