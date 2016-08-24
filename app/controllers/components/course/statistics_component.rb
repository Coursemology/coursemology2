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
        key: :student_statistics,
        title: t('course.statistics.student.header'),
        type: :admin,
        weight: 2,
        path: course_statistics_student_path(current_course)
      },
      {
        key: :staff_statistics,
        title: I18n.t('course.statistics.staff.header'),
        type: :admin,
        weight: 3,
        path: course_statistics_staff_path(current_course)
      }
    ]
  end
end
