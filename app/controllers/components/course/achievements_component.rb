# frozen_string_literal: true
class Course::AchievementsComponent < SimpleDelegator
  include Course::ControllerComponentHost::Component

  def self.display_name
    I18n.t('components.achievements.name')
  end

  def self.gamified?
    true
  end

  def sidebar_items
    [
      {
        key: :achievements,
        icon: 'trophy',
        title: I18n.t('course.achievement.achievements.sidebar_title'),
        weight: 4,
        path: course_achievements_path(current_course),
        unread: 0
      }
    ]
  end
end
