# frozen_string_literal: true
class Course::Assessment::MonitoringService
  class << self
    def params
      [:enabled, :secret, :min_interval_ms, :max_interval_ms, :offset_ms]
    end
  end

  def initialize(assessment)
    @assessment = assessment
  end

  def monitor
    @monitor ||= @assessment.monitor
  end

  def upsert!(params)
    return unless monitor.present? || params[:enabled]

    if monitor.present?
      monitor.update!(params)
    else
      @monitor = Course::Monitoring::Monitor.create!(params)
      @assessment.update!(monitor: @monitor)
    end
  end
end
