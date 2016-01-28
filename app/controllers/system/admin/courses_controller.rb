# frozen_string_literal: true
class System::Admin::CoursesController < System::Admin::Controller
  around_action :unscope_resources
  add_breadcrumb :index, :admin_courses_path

  def index
    @courses = Course.ordered_by_title.page(page_param).includes(:instance).
               search(search_param).with_owners
  end

  def destroy
    @course ||= Course.find(params[:id])

    if @course.destroy
      redirect_to admin_courses_path, success: t('.success', course: @course.title)
    else
      redirect_to admin_courses_path,
                  danger: t('.failure', error: @course.errors.full_messages.to_sentence)
    end
  end

  private

  def unscope_resources
    Course.unscoped do
      yield
    end
  end

  def search_param
    params.permit(:search)[:search]
  end
end
