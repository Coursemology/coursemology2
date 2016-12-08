# frozen_string_literal: true
module Course::LessonPlan::ItemTodoConcern
  extend ActiveSupport::Concern

  included do
    after_create :create_todos, if: :has_todo?
  end

  def has_todo?
    actable && actable.class.has_todo?
  end

  def can_user_start?(user)
    actable && actable.can_user_start?(user)
  end

  # Create todos for the given lesson_plan_item for all course_users in the course,
  # except invited course_users (ie. course_users who do not have a user record).
  #
  # A rollback of the transaction (including saving of the actable lesson_plan_item)
  # will be raised if the creation of the todo fails validations and cannot be created.
  #
  # @raise [ActiveRecord::Rollback] If the creation of the todo is invalid, the transaction will
  #   be rolled back.
  def create_todos
    course_users = CourseUser.where(course_id: course_id).where.not(workflow_state: 'invited')
    Course::LessonPlan::Todo.create_for!(self, course_users)
  rescue ActiveRecord::RecordInvalid => error
    raise ActiveRecord::Rollback, error.message
  end
end
