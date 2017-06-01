# frozen_string_literal: true
class Course::Admin::AnnouncementSettingsController < Course::Admin::Controller
  add_breadcrumb :edit, :course_admin_announcements_path

  def edit #:nodoc:
  end

  def update #:nodoc:
    if @settings.update(announcement_settings_params) && current_course.save
      redirect_to course_admin_announcements_path(current_course), success: t('.success')
    else
      render 'edit'
    end
  end

  private

  def announcement_settings_params #:nodoc:
    params.require(:settings_announcements_component).permit(:title, :pagination)
  end

  def component
    current_component_host[:course_announcements_component]
  end
end
