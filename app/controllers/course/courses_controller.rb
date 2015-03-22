class Course::CoursesController < Course::Controller
  include Course::CoursesModulesConcern

  def show #:nodoc:
  end

  def new #:nodoc:
  end

  def create #:nodoc:
    @course.course_users.build(user: current_user, name: 'name', role: :owner)

    if @course.save
      redirect_to course_settings_path(@course), notice: t('.notice', title: @course.title)
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
