# frozen_string_literal: true
module Course::LessonPlan::TodosHelper
  # A helper to add a CSS class for each todo, based on the workflow state.
  #
  # @param [Course::ReferenceTime] timeline_for_todo The reference timeline for the actual todo.
  # @return [Array<String>] CSS class to be added to the todo tag.
  def todo_status_class(timeline_for_todo)
    if timeline_for_todo.end_at && timeline_for_todo.end_at < Time.zone.now
      ['danger']
    else
      []
    end
  end
end
