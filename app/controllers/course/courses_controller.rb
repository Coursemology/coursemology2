class Course::CoursesController < Course::Controller
  def index # :nodoc:
    @courses = @courses.page(params[:page])
  end

  def show # :nodoc:
    @registration = Course::Registration.new
    render layout: 'course'
  end

  def new # :nodoc:
  end

  def create # :nodoc:
    if @course.save
      redirect_to course_settings_path(@course), success: t('.success', title: @course.title)
    else
      render 'new'
    end
  end

  def destroy # :nodoc:
  end

  private

  def course_params # :nodoc:
    params.require(:course).
      permit(:title, :description, :status, :start_at, :end_at)
  end
end
