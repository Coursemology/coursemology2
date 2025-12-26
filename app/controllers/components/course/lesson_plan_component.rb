# frozen_string_literal: true
class Course::LessonPlanComponent < SimpleDelegator
  include Course::ControllerComponentHost::Component

  def self.lesson_plan_item_actable_names
    [Course::LessonPlan::Event.name]
  end

  def sidebar_items
    main_sidebar_items + settings_sidebar_items
  end

  private

  def main_sidebar_items
    [
      {
        key: :lesson_plan,
        icon: :lessonPlan,
        weight: 8,
        path: course_lesson_plan_path(current_course)
      }
    ]
  end

  def settings_sidebar_items
    [
      {
        key: self.class.key,
        type: :settings,
        weight: 9,
        path: course_admin_lesson_plan_path(current_course)
      }
    ]
  end
end
