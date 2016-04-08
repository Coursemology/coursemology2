# frozen_string_literal: true
class Course::LessonPlanComponent < SimpleDelegator
  include Course::ControllerComponentHost::Component

  def sidebar_items
    [
      {
        key: :lesson_plan,
        title: I18n.t('course.lesson_plan.items.sidebar_title'),
        weight: 7,
        path: course_lesson_plan_path(current_course)
      }
    ]
  end
end
