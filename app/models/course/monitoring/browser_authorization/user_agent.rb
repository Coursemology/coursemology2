# frozen_string_literal: true
class Course::Monitoring::BrowserAuthorization::UserAgent < Course::Monitoring::BrowserAuthorization::Base
  def valid_heartbeat?(heartbeat)
    @monitor.secret? ? (heartbeat.user_agent&.include?(@monitor.secret) || false) : true
  end
end
