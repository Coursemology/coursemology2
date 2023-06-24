# frozen_string_literal: true
class Course::Admin::ForumSettingsController < Course::Admin::Controller
  def edit
    respond_to do |format|
      format.html { render 'course/admin/index' }
      format.json
    end
  end

  def update
    if @settings.update(forum_settings_params) && current_course.save
      render 'edit'
    else
      render json: { errors: @settings.errors }, status: :bad_request
    end
  end

  private

  def forum_settings_params
    params.require(:settings_forums_component).
      permit(:title, :pagination, :mark_post_as_answer_setting, :allow_anonymous_post)
  end

  def component
    current_component_host[:course_forums_component]
  end
end
