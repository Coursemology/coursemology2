class CoursesController < ApplicationController
  load_and_authorize_resource

  def show
  end

  def new
  end

  def create
  end

  def edit
  end

  def update
  end

  def destroy
  end

  private

  def course_params
    params.require(:course).
      permit(:title, :description, :status, :start_at, :end_at)
  end
end
