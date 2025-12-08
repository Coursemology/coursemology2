# frozen_string_literal: true
class Course::LeaderboardComponent < SimpleDelegator
  include Course::ControllerComponentHost::Component

  def self.gamified?
    true
  end

  def sidebar_items
    main_sidebar_items + settings_sidebar_items
  end

  private

  def main_sidebar_items
    [
      {
        key: :leaderboard,
        icon: :leaderboard,
        title: settings.title,
        weight: 6,
        path: course_leaderboard_path(current_course)
      }
    ]
  end

  def settings_sidebar_items
    [
      {
        key: self.class.key,
        title: settings.title,
        type: :settings,
        weight: 8,
        path: course_admin_leaderboard_path(current_course)
      }
    ]
  end
end
