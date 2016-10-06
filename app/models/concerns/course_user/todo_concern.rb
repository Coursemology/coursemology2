# frozen_string_literal: true
module CourseUser::TodoConcern
  extend ActiveSupport::Concern

  included do
    after_create :create_todos_for_course_user
  end

  def create_todos_for_course_user
    items = course.lesson_plan_items.includes(:actable).where(draft: false).select(&:has_todo?)
    Course::LessonPlan::Todo.create_for(items, self)
  end
end
