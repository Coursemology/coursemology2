# frozen_string_literal: true
class Course::Admin::LeaderboardSettingsController < Course::Admin::Controller
  add_breadcrumb :edit, :course_admin_leaderboard_path

  def edit #:nodoc:
  end

  def update #:nodoc:
    if @settings.update(leaderboard_settings_params) && current_course.save
      redirect_to course_admin_leaderboard_path(current_course), success: t('.success')
    else
      render 'edit'
    end
  end

  private

  def leaderboard_settings_params #:nodoc:
    params.require(:settings_leaderboard_component).
      permit(:title, :display_user_count, :enable_group_leaderboard, :group_leaderboard_title)
  end

  def component
    current_component_host[:course_leaderboard_component]
  end
end
