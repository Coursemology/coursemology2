# frozen_string_literal: true
module Course::Assessment::Submission::TodoConcern
  extend ActiveSupport::Concern

  included do
    after_create :update_todo
    after_destroy :restart_todo

    # Overrides #finalise method, which is part of the workflow event transition handler
    # Given the need to override this method, this concern has to be placed after the
    #   event transition handlers defined in Course::Assessment::Submission class.
    define_method :finalise do |*args|
      super(*args) if defined?(super)
      return unless todo.in_progress?
      todo.complete!
      todo.save!
    end

    # Overrides #unsubmit method, which is part of the workflow event transition handler
    # Given the need to override this method, this concern has to be placed after the
    #   event transition handlers defined in Course::Assessment::Submission class.
    define_method :unsubmit do |*args|
      super(*args) if defined?(super)
      return unless todo.completed?
      todo.uncomplete!
      todo.save!
    end
  end

  def todo
    @todo ||= begin
      lesson_plan_item_id = assessment.lesson_plan_item.id
      Course::LessonPlan::Todo.find_by(item_id: lesson_plan_item_id, user_id: creator_id)
    end
  end

  def update_todo
    return unless todo.not_started?
    todo.start!
    todo.save!
  end

  def restart_todo
    return if todo.not_started?
    todo.restart!
    todo.save!
  end
end
