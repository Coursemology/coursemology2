class Course::LessonPlanComponent < SimpleDelegator
  include Course::ComponentHost::Component

  sidebar do
    [
      {
        key: :lesson_plan,
        title: I18n.t('course.lesson_plan_items.sidebar_title'),
        weight: 3,
        path: course_lesson_plan_path(current_course)
      }
    ]
  end
end
