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
  def create_todos
    course_users = CourseUser.where(course_id: course_id).where.not(workflow_state: 'invited')
    Course::LessonPlan::Todo.create_for!(self, course_users)
  end
end
