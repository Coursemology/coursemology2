# frozen_string_literal: true
module Course::Assessment::Submission::MonitoringConcern
  extend ActiveSupport::Concern

  included do
    before_action :check_blocked_by_monitor, only: [:create, :edit, :update]

    after_action :stop_monitoring_session_if_submitted, only: [:update]
  end

  def should_monitor? # rubocop:disable Metrics/CyclomaticComplexity
    monitoring_component_enabled? &&
      current_user.id == @submission.creator_id &&
      current_course_user&.student? &&
      can?(:create, Course::Monitoring::Session.new(creator_id: current_user.id)) &&
      @assessment&.monitor&.enabled? &&
      !@submission.submitted?
  end

  def monitoring_service
    return unless should_monitor? || can_update_monitoring_session?

    @monitoring_service ||= Course::Assessment::Submission::MonitoringService.for(@submission, @assessment, session)
  end

  private

  def monitoring_component_enabled?
    current_component_host[:course_monitoring_component].present?
  end

  def can_update_monitoring_session?
    can?(:update, Course::Monitoring::Session.new)
  end

  def stop_monitoring_session_if_submitted
    monitoring_service&.stop! if @submission.submitted?
  end

  def check_blocked_by_monitor
    render json: { newSessionUrl: course_assessment_path(current_course, @assessment) } if blocked_by_monitor?
  end

  def blocked_by_monitor?
    should_monitor? && monitoring_service&.should_block?(request.user_agent)
  end
end
