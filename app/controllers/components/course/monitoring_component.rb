# frozen_string_literal: true
class Course::MonitoringComponent < SimpleDelegator
  include Course::ControllerComponentHost::Component

  def self.display_name
    I18n.t('components.monitoring.name')
  end

  def self.enabled_by_default?
    false
  end
end
