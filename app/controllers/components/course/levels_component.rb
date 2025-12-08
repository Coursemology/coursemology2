# frozen_string_literal: true
class Course::LevelsComponent < SimpleDelegator
  include Course::ControllerComponentHost::Component

  def self.gamified?
    true
  end

  def sidebar_items
    return [] unless can?(:read, Course::Level.new(course: current_course))

    [
      {
        key: self.class.key,
        icon: :levels,
        type: :admin,
        weight: 6,
        path: course_levels_path(current_course)
      }
    ]
  end
end
