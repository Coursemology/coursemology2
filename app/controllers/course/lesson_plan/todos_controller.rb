# frozen_string_literal: true
class Course::LessonPlan::TodosController < Course::LessonPlan::Controller
  load_and_authorize_resource :todo, class: Course::LessonPlan::Todo.name

  def ignore
    if @todo.update_column(:ignore, true) # rubocop:disable Style/GuardClause:
      flash.now[:success] = t('.success')
    end
  end
end
