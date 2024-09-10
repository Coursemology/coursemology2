# frozen_string_literal: true
class Course::Monitoring::BrowserAuthorization::Base
  def initialize(monitor)
    @monitor = monitor
  end

  def valid?(monitor, heartbeat)
    raise NotImplementedError
  end
end
