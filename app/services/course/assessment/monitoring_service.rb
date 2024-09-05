# frozen_string_literal: true
class Course::Assessment::MonitoringService
  class << self
    def params
      [
        :enabled,
        :min_interval_ms,
        :max_interval_ms,
        :offset_ms,
        :blocks,
        :browser_authorization,
        :browser_authorization_method,
        :secret,
        :seb_config_key
      ]
    end

    def unblocked_browser_session_key(assessment_id)
      "assessment_#{assessment_id}_unblocked_by_monitor"
    end

    def unblocked?(assessment_id, browser_session)
      browser_session[unblocked_browser_session_key(assessment_id)] == true
    end
  end

  def initialize(assessment, browser_session)
    @assessment = assessment
    @browser_session = browser_session
  end

  def monitor
    @monitor ||= @assessment.monitor
  end

  def upsert!(params)
    return unless monitor.present? || params[:enabled]

    if monitor.present?
      monitor.update!(params)
    else
      @monitor = Course::Monitoring::Monitor.create!(params) do |monitor|
        monitor.assessment = @assessment
      end
    end
  end

  def should_block?(string)
    !unblocked? && monitor&.blocks? && !monitor&.valid_secret?(string)
  end

  def unblock(session_password)
    return true unless @assessment.session_password_protected?

    if @assessment.session_password == session_password
      set_browser_session_unblocked!
      return true
    end

    false
  end

  private

  def set_browser_session_unblocked!
    @browser_session[unblocked_browser_session_key] = true
  end

  def unblocked?
    Course::Assessment::MonitoringService.unblocked?(@assessment.id, @browser_session)
  end

  def unblocked_browser_session_key
    @unblocked_browser_session_key ||=
      Course::Assessment::MonitoringService.unblocked_browser_session_key(@assessment.id)
  end
end
