# frozen_string_literal: true
class Course::AchievementsComponent < SimpleDelegator
  include Course::ControllerComponentHost::Component

  def self.gamified?
    true
  end

  def sidebar_items
    [
      {
        key: :achievements,
        icon: :achievement,
        weight: 4,
        path: course_achievements_path(current_course)
      }
    ]
  end
end
