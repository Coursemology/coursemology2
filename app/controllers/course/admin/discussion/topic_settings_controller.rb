# frozen_string_literal: true
class Course::Admin::Discussion::TopicSettingsController < Course::Admin::Controller
  def edit
    respond_to do |format|
      format.json
    end
  end

  def update
    if @settings.update(topic_settings_params) && current_course.save
      render 'edit'
    else
      render json: { errors: @settings.errors }, status: :bad_request
    end
  end

  private

  def topic_settings_params
    params.require(:settings_topics_component).permit(:title, :pagination, :is_showing_ai_generated_comments)
  end

  def component
    current_component_host[:course_discussion_topics_component]
  end
end
