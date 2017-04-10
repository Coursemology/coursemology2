# frozen_string_literal: true
class Course::Admin::VirtualClassroomSettingsController < Course::Admin::Controller
  add_breadcrumb :edit, :course_admin_virtual_classrooms_path
  before_action :load_settings

  def edit; end #:nodoc:

  def update #:nodoc:
    if @settings.update(virtual_classroom_settings_params) && current_course.save
      redirect_to course_admin_virtual_classrooms_path(current_course), success: t('.success')
    else
      render 'edit'
    end
  end

  private

  def virtual_classroom_settings_params #:nodoc:
    params.require(:virtual_classroom_settings).permit(
      :title, :pagination, :braincert_whiteboard_api_key, :max_duration, :braincert_server_region
    )
  end

  # Load our settings adapter to handle virtual classroom settings
  def load_settings
    @settings ||= Course::VirtualClassroomSettings.new(current_course.settings(:virtual_classroom))
  end
end
