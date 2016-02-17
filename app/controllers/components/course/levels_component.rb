# frozen_string_literal: true
class Course::LevelsComponent < SimpleDelegator
  include Course::ControllerComponentHost::Component

  def sidebar_items
    return [] unless can?(:manage, Course::Level.new(course: current_course))

    [
      {
        key: :levels,
        title: I18n.t('course.levels.sidebar_title'),
        type: :admin,
        weight: 2,
        path: course_levels_path(current_course)
      }
    ]
  end
end
