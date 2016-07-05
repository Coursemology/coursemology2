# frozen_string_literal: true
class Course::Admin::Discussion::TopicSettingsController < Course::Admin::Controller
  add_breadcrumb :edit, :course_admin_topics_path
  before_action :load_settings

  def edit
  end

  def update
    if @settings.update(topic_settings_params) && current_course.save
      redirect_to course_admin_topics_path(current_course), success: t('.success')
    else
      render 'edit'
    end
  end

  private

  def topic_settings_params
    params.require(:discussion_topic_settings).permit(:title, :pagination)
  end

  def load_settings
    @settings ||= Course::Discussion::TopicSettings.new(current_course.settings(:discussion_topics))
  end
end
