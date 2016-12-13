# frozen_string_literal: true
module Course::Survey::Response::TodoConcern
  extend ActiveSupport::Concern

  included do
    after_save :update_todo
    after_destroy :restart_todo
  end

  private

  def todo
    @todo ||= begin
      lesson_plan_item_id = survey.lesson_plan_item.id
      Course::LessonPlan::Todo.find_by(item_id: lesson_plan_item_id, user_id: creator_id)
    end
  end

  def update_todo
    if submitted?
      todo.update_column(:workflow_state, 'completed') unless todo.completed?
    else
      todo.update_column(:workflow_state, 'in_progress') unless todo.in_progress?
    end
  rescue ActiveRecordError => error
    raise ActiveRecord::Rollback, error.message
  end

  def restart_todo
    todo.update_column(:workflow_state, 'not_started') unless todo.not_started?
  rescue ActiveRecordError => error
    raise ActiveRecord::Rollback, error.message
  end
end
