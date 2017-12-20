# frozen_string_literal: true
class Course::LessonPlanComponent < SimpleDelegator
  include Course::ControllerComponentHost::Component

  def self.display_name
    I18n.t('components.lesson_plan.name')
  end

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
        icon: 'book',
        title: I18n.t('course.lesson_plan.items.sidebar_title'),
        weight: 8,
        path: course_lesson_plan_path(current_course)
      }
    ]
  end

  def settings_sidebar_items
    [
      {
        title: t('layouts.course_admin.lesson_plan.title'),
        type: :settings,
        weight: 9,
        path: course_admin_lesson_plan_path(current_course)
      }
    ]
  end
end
