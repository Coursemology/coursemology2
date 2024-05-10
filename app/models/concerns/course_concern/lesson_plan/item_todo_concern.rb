# frozen_string_literal: true
module CourseConcern
  module LessonPlan::ItemTodoConcern
    extend ActiveSupport::Concern

    included do
      after_create :create_todos, if: :has_todo?
      around_update :handle_todos, if: :has_todo_changed?
    end

    def can_user_start?(user)
      actable&.can_user_start?(user)
    end

    # Create todos for the given lesson_plan_item for all course_users in the course.
    def create_todos
      course_users = CourseUser.where(course_id: course_id)
      Course::LessonPlan::Todo.create_for!(self, course_users)
    end

    # Create todos for users without todos when an item's has_todo is set to true and
    # destroy unstarted and unignored todos when has_todo is set to false.
    # Create todos are only created for users without todos to ensure data uniqueness for a certain item.
    # This could be the case when todos are destro when has_todo is set to false and true again.
    # Todos are destroyed this way so that when has_todo is set to false and true again,
    # we do not recreate todos that are already ignored or completed/in-progress.
    def handle_todos
      yield

      if has_todo
        existing_todo_user_ids = todos.pluck(:user_id)
        course_users = CourseUser.where(course_id: course_id).where.not(user_id: existing_todo_user_ids)
        Course::LessonPlan::Todo.create_for!(self, course_users)
      else
        todos.not_started.not_ignored.delete_all
      end
    end
  end
end
