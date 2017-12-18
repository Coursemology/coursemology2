# frozen_string_literal: true
class Course::LevelsController < Course::ComponentController
  load_and_authorize_resource :level, through: :course, class: Course::Level.name
  add_breadcrumb :index, :course_levels_path

  def index #:nodoc:
  end

  def create #:nodoc:
    respond_to do |format|
      if current_course.mass_update_levels(params[:levels])
        format.json { render json: current_course.levels, status: :created }
      else
        format.json { render json: current_course.errors, status: :unprocessable_entity }
      end
    end
  end
end
