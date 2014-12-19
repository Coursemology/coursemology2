class Courses::CoursesController < Courses::Controllers
  load_and_authorize_resource

  def show #:nodoc:
  end

  def new #:nodoc:
  end

  def create #:nodoc:
  end

  def edit #:nodoc:
  end

  def update #:nodoc:
  end

  def destroy #:nodoc:
  end

  private

  def course_params #:nodoc:
    params.require(:course).
      permit(:title, :description, :status, :start_at, :end_at)
  end
end
