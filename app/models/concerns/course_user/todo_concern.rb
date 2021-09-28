# frozen_string_literal: true
module CourseUser::TodoConcern
  extend ActiveSupport::Concern

  included do
    after_create :create_todos_for_course_user
    after_destroy :delete_todos
  end

  # Create todos for all course_users.
  def create_todos_for_course_user
    return unless user

    items =
      Course::LessonPlan::Item.where(course_id: course_id).includes(:actable).select(&:has_todo?)
    Course::LessonPlan::Todo.create_for!(items, self)
  end

  # Delete all todos of the user in current course.
  def delete_todos
    items_in_current_course =
      Course::LessonPlan::Item.where(course_id: course_id).select(:id)
    Course::LessonPlan::Todo.where(user_id: user_id, item_id: items_in_current_course).delete_all
  end
end
