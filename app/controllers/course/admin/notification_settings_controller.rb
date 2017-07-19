# frozen_string_literal: true
class Course::Admin::NotificationSettingsController < Course::Admin::Controller
  before_action :load_settings
  add_breadcrumb :edit, :course_admin_notifications_path

  def edit
    @page_data = @settings.email_settings.to_json
  end

  def update
    if @settings.update(notification_settings_params) && current_course.save
      render json: @settings.email_settings
    else
      head :bad_request
    end
  end

  private

  def notification_settings_params
    params.require(:notification_settings)
  end

  def load_settings
    @settings = Course::Settings::Notifications.new(current_component_host.components)
  end
end
