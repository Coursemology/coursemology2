# frozen_string_literal: true
class Course::LevelsController < Course::ComponentController
  load_and_authorize_resource :level, through: :course, class: 'Course::Level'

  def index
  end

  def create
    respond_to do |format|
      if current_course.mass_update_levels(params[:levels])
        format.json { render json: current_course.levels, status: :created }
      else
        format.json { render json: current_course.errors, status: :unprocessable_entity }
      end
    end
  end

  private

  # @return [Course::LevelsComponent]
  # @return [nil] If component is disabled.
  def component
    current_component_host[:course_levels_component]
  end
end
