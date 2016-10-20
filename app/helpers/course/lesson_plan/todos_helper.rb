# frozen_string_literal: true
module Course::LessonPlan::TodosHelper
  # A helper to add a CSS class for each todo, based on the workflow state.
  #
  # @param [Course::LessonPlan::Todo] todo The actual todo.
  # @return [Array<String>] CSS class to be added to the todo tag.
  def todo_status_class(todo)
    if todo.item.end_at && todo.item.end_at < Time.zone.now
      ['danger']
    else
      []
    end
  end
end
