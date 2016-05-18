# frozen_string_literal: true
class Course::Admin::LeaderboardSettingsController < Course::Admin::Controller
  add_breadcrumb :edit, :course_admin_leaderboard_path
  before_action :load_settings

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
    params.require(:leaderboard_settings).
      permit(:title, :display_user_count, :enable_group_leaderboard, :group_leaderboard_title)
  end

  # Load our settings adapter to handle leaderboard settings
  def load_settings
    @settings ||= Course::LeaderboardSettings.new(current_course.settings(:leaderboard))
  end
end
