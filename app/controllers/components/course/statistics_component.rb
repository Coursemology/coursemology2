# frozen_string_literal: true
class Course::StatisticsComponent < SimpleDelegator
  include Course::ControllerComponentHost::Component

  def self.display_name
    I18n.t('components.statistics.name')
  end

  def sidebar_items
    return [] unless can?(:read_statistics, current_course)

    [
      {
        key: :statistics,
        icon: :statistics,
        title: t('course.statistics.header'),
        type: :admin,
        weight: 3,
        path: course_statistics_students_path(current_course)
      }
    ]
  end
end
