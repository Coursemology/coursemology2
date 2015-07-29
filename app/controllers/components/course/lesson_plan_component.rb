class Course::LessonPlanComponent < SimpleDelegator
  include Course::ComponentHost::Component

  def sidebar_items
    [
      {
        key: :lesson_plan,
        title: I18n.t('course.lesson_plan.items.sidebar_title'),
        weight: 3,
        path: course_lesson_plan_path(current_course)
      }
    ]
  end
end
