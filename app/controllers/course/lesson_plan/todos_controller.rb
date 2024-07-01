# frozen_string_literal: true
class Course::LessonPlan::TodosController < Course::LessonPlan::Controller
  build_and_authorize_new_lesson_plan_item :todo, class: Course::LessonPlan::Todo, only: [:new, :create]
  load_and_authorize_resource :todo, class: 'Course::LessonPlan::Todo', except: [:new, :create]

  def ignore
    if @todo.update_column(:ignore, true)
      render json: { id: @todo.id }, status: :ok
    else
      render json: { errors: @todo.errors }, status: :bad_request
    end
  end
end
