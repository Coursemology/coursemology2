# frozen_string_literal: true
class Course::MonitoringComponent < SimpleDelegator
  include Course::ControllerComponentHost::Component

  def self.enabled_by_default?
    false
  end
end
