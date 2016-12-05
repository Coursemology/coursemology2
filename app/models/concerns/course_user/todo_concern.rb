# frozen_string_literal: true
module CourseUser::TodoConcern
  extend ActiveSupport::Concern

  included do
    after_create :create_todos_for_course_user
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
  #
  # @raise [ActiveRecord::Rollback] If the creation of the todo is invalid, the transaction will
  #   be rolled back.
  def create_todos_for_course_user
    return unless user
    items =
      Course::LessonPlan::Item.where(course_id: course_id).includes(:actable).select(&:has_todo?)
    Course::LessonPlan::Todo.create_for!(items, self)
  rescue ActiveRecord::RecordInvalid => error
    raise ActiveRecord::Rollback, error.message
  end
end
