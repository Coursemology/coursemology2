class Courses::CoursesController < Courses::Controllers
  load_and_authorize_resource

  def show #:nodoc:
  end

  def new #:nodoc:
  end

  def create #:nodoc:
    @course.course_users.build(user: current_user, name: 'name', role: :owner)

    if @course.save
      redirect_to edit_course_path(@course), notice: t('.notice', title: @course.title)
    else
      render 'new'
    end
  end

  def edit #:nodoc:
  end

  def update #:nodoc:
    if @course.update_attributes(course_params)
      redirect_to course_path(@course), notice: t('.notice', title: @course.title)
    else
      render 'edit'
    end
  end

  def destroy #:nodoc:
  end

  private

  def course_params #:nodoc:
    params.require(:course).
      permit(:title, :description, :status, :start_at, :end_at)
  end
end
