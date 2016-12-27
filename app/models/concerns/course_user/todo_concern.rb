# frozen_string_literal: true
module CourseUser::TodoConcern
  extend ActiveSupport::Concern

  included do
    after_create :create_todos_for_course_user
    after_destroy :delete_todos
  end

  # Overrides #accept method, which is part of the workflow event transition handler
  # Given the need to override this method, this concern has to be placed after the
  #   event transition handlers defined in CourseUser class.
  def accept(*args)
    super(*args) if defined?(super)
    create_todos_for_course_user
  end

  # Create todos for all course_users except those who are invited.
  # Invited course_users do not have a user_id.
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
