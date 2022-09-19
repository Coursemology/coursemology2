# frozen_string_literal: true
class Course::Admin::AnnouncementSettingsController < Course::Admin::Controller
  add_breadcrumb :edit, :course_admin_announcements_path

  def edit
    respond_to do |format|
      format.html { render 'course/admin/index' }
      format.json
    end
  end

  def update
    if @settings.update(announcement_settings_params) && current_course.save
      render 'edit'
    else
      render json: { errors: @settings.errors }, status: :bad_request
    end
  end

  private

  def announcement_settings_params
    params.require(:settings_announcements_component).permit(:title)
  end

  def component
    current_component_host[:course_announcements_component]
  end
end
