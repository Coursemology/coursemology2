# frozen_string_literal: true
module Course::LessonPlan::ItemTodoConcern
  extend ActiveSupport::Concern

  included do
    after_save :create_or_delete_todos, if: :has_todo?
  end

  def has_todo?
    actable && actable.class.has_todo?
  end

  protected

  # Callback to create or delete todos when lesson_plan_item's draft status is changed.
  #    Todos are created for all course_users in the course.
  # Uses ActiveModel::Dirty to check attribute changes.
  def create_or_delete_todos
    return unless draft_changed?
    if draft_changed? from: true, to: false
      Course::LessonPlan::Todo.create_for(self, course.course_users)
    elsif draft_changed? from: false, to: true
      Course::LessonPlan::Todo.delete_for(self)
    end
  end
end
