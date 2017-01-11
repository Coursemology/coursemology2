# frozen_string_literal: true
class Course::Admin::VideoSettingsController < Course::Admin::Controller
  add_breadcrumb :edit, :course_admin_videos_path
  before_action :load_settings

  def edit; end

  def update
    if @settings.update(video_settings_params) && current_course.save
      redirect_to course_admin_videos_path(current_course), success: t('.success')
    else
      render 'edit'
    end
  end

  private

  def video_settings_params #:nodoc:
    params.require(:video_settings).permit(:title)
  end

  # Load our settings adapter to handle video settings
  def load_settings
    @settings ||= Course::VideoSettings.new(current_course.settings(:video))
  end
end
