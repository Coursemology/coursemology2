# frozen_string_literal: true
class Course::Admin::LeaderboardSettingsController < Course::Admin::Controller
  def edit
    respond_to do |format|
      format.html { render 'course/admin/index' }
      format.json
    end
  end

  def update
    if @settings.update(leaderboard_settings_params) && current_course.save
      render 'edit'
    else
      render json: { errors: @settings.errors }, status: :bad_request
    end
  end

  private

  def leaderboard_settings_params
    params.require(:settings_leaderboard_component).
      permit(:title, :display_user_count, :enable_group_leaderboard, :group_leaderboard_title)
  end

  def component
    current_component_host[:course_leaderboard_component]
  end
end
