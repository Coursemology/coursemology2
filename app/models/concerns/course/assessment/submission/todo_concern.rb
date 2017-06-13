# frozen_string_literal: true
module Course::Assessment::Submission::TodoConcern
  extend ActiveSupport::Concern

  included do
    after_save :update_todo, if: :workflow_state_changed?
    after_destroy :restart_todo
  end

  private

  def todo
    @todo ||= begin
      lesson_plan_item_id = assessment.lesson_plan_item.id
      Course::LessonPlan::Todo.find_by(item_id: lesson_plan_item_id, user_id: creator_id)
    end
  end

  def update_todo
    return unless todo

    if attempting?
      todo.update_attribute(:workflow_state, 'in_progress') unless todo.in_progress?
    elsif submitted? || graded? || published?
      todo.update_attribute(:workflow_state, 'completed') unless todo.completed?
    end
  rescue ActiveRecord::ActiveRecordError => error
    raise ActiveRecord::Rollback, error.message
  end

  # Skip callback if assessment is deleted as todo will be deleted.
  def restart_todo
    return if assessment.destroying? || todo.nil?

    todo.update_attribute(:workflow_state, 'not_started') unless todo.not_started?
  rescue ActiveRecord::ActiveRecordError => error
    raise ActiveRecord::Rollback, error.message
  end
end
