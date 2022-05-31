# frozen_string_literal: true
class Course::LeaderboardsController < Course::ComponentController
  include Course::LeaderboardsHelper
  before_action :add_leaderboard_breadcrumb
  before_action :check_component_settings
  before_action :preload_course_levels, only: [:index]

  def index # :nodoc:
    course_users = @course.course_users.students.without_phantom_users.includes(:user)
    achievements_enabled = current_component_host[:course_achievements_component].present?

    @course_users_points = course_users.ordered_by_experience_points.take(display_user_count)
    if achievements_enabled
      @course_users_count = course_users.ordered_by_achievement_count.take(display_user_count)
    end
  end

  def show # :nodoc:
    @course_users = @course.course_users.students.without_phantom_users.includes(:user)
  end

  def groups # :nodoc:
    @groups ||= @course.groups
  end

  private

  # Checks if group leaderboard setting is enabled
  #
  # @raise [Coursemology::ComponentNotFoundError] When the group leaderboard is disabled.
  def check_component_settings
    case params[:action]
    when 'groups'
      raise ComponentNotFoundError unless @settings.enable_group_leaderboard
    end
  end

  # Preload course.levels to reduce SQL calls in leaderboard view. See course#level_for.
  def preload_course_levels
    @course.levels.to_a
  end

  def add_leaderboard_breadcrumb
    add_breadcrumb @settings.title || :index, :course_leaderboard_path
  end

  # @return [Course::LeaderboardComponent] The leaderboard component.
  # @return [nil] If leaderboard component is disabled.
  def component
    current_component_host[:course_leaderboard_component]
  end
end
