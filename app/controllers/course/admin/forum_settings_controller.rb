# frozen_string_literal: true
class Course::Admin::ForumSettingsController < Course::Admin::Controller
  add_breadcrumb :edit, :course_admin_forums_path

  def edit
  end

  def update
    if @settings.update(forum_settings_params) && current_course.save
      redirect_to course_admin_forums_path(current_course), success: t('.success')
    else
      render 'edit'
    end
  end

  private

  def forum_settings_params #:nodoc:
    params.require(:settings_forums_component).permit(:title, :pagination)
  end

  def component
    current_component_host[:course_forums_component]
  end
end
