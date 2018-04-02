# frozen_string_literal: true
module Course::LessonPlan::ItemTodoConcern
  extend ActiveSupport::Concern

  included do
    after_create :create_todos, if: :has_todo?
  end

  def has_todo?
    actable&.class&.has_todo?
  end

  def can_user_start?(user)
    actable&.can_user_start?(user)
  end

  # Create todos for the given lesson_plan_item for all course_users in the course.
  def create_todos
    course_users = CourseUser.where(course_id: course_id)
    Course::LessonPlan::Todo.create_for!(self, course_users)
  end
end
