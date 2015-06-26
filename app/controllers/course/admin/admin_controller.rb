class Course::Admin::AdminController < Course::Admin::Controller
  add_breadcrumb :index, :course_admin_path

  def index
  end

  def update #:nodoc:
    if current_course.update_attributes(course_setting_params)
      redirect_to course_admin_path(current_course),
                  success: t('.success', title: current_course.title)
    else
      render 'index'
    end
  end

  private

  def course_setting_params #:nodoc:
    params.require(:course).
      permit(:title, :description, :status, :start_at, :end_at)
  end
end
