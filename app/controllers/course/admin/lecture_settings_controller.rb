# frozen_string_literal: true
class Course::Admin::LectureSettingsController < Course::Admin::Controller
  add_breadcrumb :edit, :course_admin_lectures_path
  before_action :load_settings

  def edit #:nodoc:
  end

  def update #:nodoc:
    if @settings.update(lecture_settings_params) && current_course.save
      redirect_to course_admin_lectures_path(current_course), success: t('.success')
    else
      render 'edit'
    end
  end

  private

  def lecture_settings_params #:nodoc:
    params.require(:lecture_settings).permit(:title, :pagination)
  end

  # Load our settings adapter to handle lecture settings
  def load_settings
    @settings ||= Course::LectureSettings.new(current_course.settings(:lecture))
  end
end