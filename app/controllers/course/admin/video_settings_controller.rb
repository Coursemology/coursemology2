# frozen_string_literal: true
class Course::Admin::VideoSettingsController < Course::Admin::Controller
  add_breadcrumb :edit, :course_admin_videos_path

  def edit; end

  def update
    if @settings.update(video_settings_params) &&
       current_course.update(video_tabs_params) &&
       current_course.save

      redirect_to course_admin_videos_path(current_course), success: t('.success')
    else
      render 'edit'
    end
  end

  private

  def video_settings_params #:nodoc:
    params.require(:settings_videos_component).permit(:title)
  end

  def video_tabs_params
    params.
      require(:settings_videos_component).
      require(:course).
      permit(video_tabs_attributes: [:id, :title, :weight])
  end

  def component
    current_component_host[:course_videos_component]
  end
end
