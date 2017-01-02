# frozen_string_literal: true
module Course::Video::Submission::TodoConcern
  extend ActiveSupport::Concern

  included do
    after_create :complete_todo
    after_destroy :restart_todo
  end

  private

  def todo
    @todo ||= begin
      lesson_plan_item_id = video.lesson_plan_item.id
      Course::LessonPlan::Todo.find_by(item_id: lesson_plan_item_id, user_id: creator_id)
    end
  end

  def complete_todo
    todo.update_attribute(:workflow_state, 'completed') unless todo.completed?
  end

  def restart_todo
    todo.update_attribute(:workflow_state, 'not_started') unless todo.not_started?
  end
end
