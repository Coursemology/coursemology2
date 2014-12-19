class CoursesController < ApplicationController
  load_and_authorize_resource

  def show
  end

  def new
  end

  def create
    @course.course_users.build(user: current_user, name: 'name', role: :owner)
    if @course.save
      redirect_to edit_course_path(@course)
    else
      render 'new'
    end
  end

  def edit
  end

  def update
    if @course.update_attributes(course_params)
      redirect_to course_path(@course), notice: 'Course updated'
    else
      render 'edit'
    end
  end

  def destroy
  end

  private

  def course_params
    params.require(:course).
      permit(:title, :description, :status, :start_at, :end_at)
  end
end
