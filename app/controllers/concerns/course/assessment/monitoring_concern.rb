# frozen_string_literal: true
module Course::Assessment::MonitoringConcern
  extend ActiveSupport::Concern

  included do
    alias_method :load_monitor, :monitor
    alias_method :load_can_manage_monitor?, :can_manage_monitor?
    alias_method :load_monitoring_component_enabled?, :monitoring_component_enabled?

    before_action :load_monitor, only: [:edit, :show]
    before_action :load_can_manage_monitor?, only: [:index, :edit]
    before_action :load_monitoring_component_enabled?, only: [:index, :edit]

    before_action :raise_if_no_monitor, only: [:monitoring, :unblock_monitor]
    before_action :check_blocked_by_monitor, only: [:show]
  end

  def monitoring
    authorize! :read, @monitor
  end

  def unblock_monitor
    session_password = unblock_monitor_params[:password]

    if monitoring_service&.unblock(session_password)
      render json: { redirectUrl: course_assessment_path(current_course, @assessment) }
    else
      render json: { errors: t('course.assessment.assessments.unblock_monitor.invalid_password') }, status: :bad_request
    end
  end

  def upsert_monitoring!
    monitoring_service&.upsert!(monitoring_params.merge({
      enabled: @assessment.view_password_protected? ? monitoring_params[:enabled] : false,
      blocks: should_disable_block? ? false : monitoring_params[:blocks]
    }))
  end

  private

  def monitoring_params
    params.require(:assessment).permit(monitoring: Course::Assessment::MonitoringService.params)[:monitoring]
  end

  def unblock_monitor_params
    params.require(:assessment).permit(:password)
  end

  def raise_if_no_monitor
    raise ComponentNotFoundError if monitor.nil?
  end

  def check_blocked_by_monitor
    render 'blocked_by_monitor' if blocked_by_monitor?
  end

  def blocked_by_monitor?
    cannot?(:read, monitor) && monitoring_service&.should_block?(request.user_agent)
  end

  def monitoring_service
    return unless monitoring_component_enabled?

    @monitoring_service ||= Course::Assessment::MonitoringService.new(@assessment, session)
  end

  def monitoring_component_enabled?
    @monitoring_component_enabled ||= current_component_host[:course_monitoring_component].present?
  end

  def can_manage_monitor?
    @can_manage_monitor ||= can?(:manage, Course::Monitoring::Monitor.new)
  end

  def monitor
    @monitor ||= monitoring_service&.monitor
  end

  def should_disable_block?
    !@assessment.session_password_protected? || monitor.secret.blank?
  end
end
