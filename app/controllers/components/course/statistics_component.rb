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
        icon: 'bar-chart',
        title: t('course.statistics.student.header'),
        type: :admin,
        weight: 2,
        path: statistics_student_url
      },
      {
        key: :staff_statistics,
        icon: 'bar-chart',
        title: I18n.t('course.statistics.staff.header'),
        type: :admin,
        weight: 3,
        path: course_statistics_staff_path(current_course)
      }
    ]
  end

  # Path for the student statistics tab depends on whether the user has students.
  def statistics_student_url
    if current_course_user&.my_students&.any?
      course_statistics_my_students_path(current_course)
    else
      course_statistics_all_students_path(current_course)
    end
  end
end
