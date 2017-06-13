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
    return unless todo

    if submitted?
      todo.update_attribute(:workflow_state, 'completed') unless todo.completed?
    else
      todo.update_attribute(:workflow_state, 'in_progress') unless todo.in_progress?
    end
  rescue ActiveRecord::ActiveRecordError => error
    raise ActiveRecord::Rollback, error.message
  end

  # Skip callback if survey is deleted as todo will be deleted.
  def restart_todo
    return if survey.destroying? || todo.nil?
    todo.update_attribute(:workflow_state, 'not_started') unless todo.not_started?
  rescue ActiveRecord::ActiveRecordError => error
    raise ActiveRecord::Rollback, error.message
  end
end
