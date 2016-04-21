# frozen_string_literal: true
class Course::LeaderboardComponent < SimpleDelegator
  include Course::ControllerComponentHost::Component

  def self.display_name
    I18n.t('components.leaderboard.name')
  end

  def sidebar_items
    main_sidebar_items + settings_sidebar_items
  end

  def settings
    @settings ||= Course::LeaderboardSettings.new(current_course.settings(:leaderboard))
  end

  private

  def main_sidebar_items
    [
      {
        key: :leaderboard,
        title: settings.title || t('course.leaderboards.sidebar_title'),
        weight: 5,
        path: course_leaderboard_path(current_course)
      }
    ]
  end

  def settings_sidebar_items
    [
      {
        title: settings.title || t('course.leaderboards.title'),
        type: :settings,
        weight: 4,
        path: course_admin_leaderboard_path(current_course)
      }
    ]
  end
end
