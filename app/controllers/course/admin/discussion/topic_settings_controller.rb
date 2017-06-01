# frozen_string_literal: true
class Course::Admin::Discussion::TopicSettingsController < Course::Admin::Controller
  add_breadcrumb :edit, :course_admin_topics_path

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
    params.require(:settings_topics_component).permit(:title, :pagination)
  end

  def component
    current_component_host[:course_discussion_topics_component]
  end
end
