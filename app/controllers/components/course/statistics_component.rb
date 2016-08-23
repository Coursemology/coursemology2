# frozen_string_literal: true
class Course::StatisticsComponent < SimpleDelegator
  include Course::ControllerComponentHost::Component

  def self.display_name
    I18n.t('components.statistics.name')
  end

  def sidebar_items
    [
      {
        key: :student_statistics,
        title: t('course.statistics.student.header'),
        type: :admin,
        weight: 1,
        path: course_statistics_student_path(current_course)
      }
    ]
  end
end
