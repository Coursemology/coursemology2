class Course::CoursesController < Course::Controller
  def show #:nodoc:
  end

  def new #:nodoc:
  end

  def create #:nodoc:
    @course.course_users.build(user: current_user, name: 'name', role: :owner,
                               workflow_state: :approved)

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
