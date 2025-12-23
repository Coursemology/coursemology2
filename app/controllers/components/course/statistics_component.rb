# frozen_string_literal: true
class Course::StatisticsComponent < SimpleDelegator
  include Course::ControllerComponentHost::Component

  def sidebar_items
    return [] unless can?(:read_statistics, current_course)

    [
      {
        key: self.class.key,
        icon: :statistics,
        type: :admin,
        weight: 3,
        path: course_statistics_students_path(current_course)
      }
    ]
  end
end
