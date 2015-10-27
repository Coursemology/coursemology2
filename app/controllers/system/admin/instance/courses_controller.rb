class System::Admin::Instance::CoursesController < System::Admin::Instance::Controller
  load_and_authorize_resource :course, through: :instance

  add_breadcrumb :index, :admin_instance_courses_path

  def index
    @courses = @instance.courses.ordered_by_title.page(params[:page]).with_owners
  end

  def destroy
    if @course.destroy
      redirect_to admin_instance_courses_path, success: t('.success', course: @course.title)
    else
      redirect_to admin_instance_courses_path,
                  danger: t('.failure', error: @course.errors.full_messages.to_sentence)
    end
  end
end
