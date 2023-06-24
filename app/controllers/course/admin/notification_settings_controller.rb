# frozen_string_literal: true
class Course::Admin::NotificationSettingsController < Course::Admin::Controller
  def edit
    respond_to do |format|
      format.html { render 'course/admin/index' }
      format.json { @page_data = page_data }
    end
  end

  def update
    email_setting = current_course.email_settings_with_enabled_components.
                    where(notification_settings_params).first
    email_setting.update!(notification_enabled_params)
    page_data = current_course.email_settings_with_enabled_components.sorted_for_page_setting
    render json: page_data
  end

  private

  def page_data
    current_course.email_settings_with_enabled_components.sorted_for_page_setting
  end

  def notification_settings_params
    params.require(:email_settings).permit(:component, :course_assessment_category_id, :setting)
  end

  def notification_enabled_params
    params.require(:email_settings).permit(:phantom, :regular)
  end
end
