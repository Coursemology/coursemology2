class Course::CoursesController < Course::Controller
  include ActivitiesConcern

  def show #:nodoc:
    @activities = recent_activities(current_course, number: 20)
  end

  def new #:nodoc:
  end

  def create #:nodoc:
    if @course.save
      redirect_to course_settings_path(@course), success: t('.success', title: @course.title)
    else
      render 'new'
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
