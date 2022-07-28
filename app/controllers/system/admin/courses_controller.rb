# frozen_string_literal: true
class System::Admin::CoursesController < System::Admin::Controller
  around_action :unscope_resources
  add_breadcrumb :index, :admin_courses_path

  def index
    @courses = Course.includes(:instance).search(search_param).calculated(:active_user_count, :user_count)
    @courses = @courses.active_in_past_7_days.order('active_user_count DESC, user_count') if params[:active].present?
    @courses = @courses.ordered_by_title
    @search_count = @courses.length
    @courses = @courses.paginate(page_param)

    @owner_preload_service = Course::CourseOwnerPreloadService.new(@courses.map(&:id))
  end

  def destroy
    @course ||= Course.find(params[:id])

    if @course.destroy
      head :ok
    else
      render json: { errors: @course.errors.full_messages.to_sentence }, status: :bad_request
    end
  end

  private

  def search_param
    params.permit(:search)[:search]
  end

  def unscope_resources(&block)
    Course.unscoped(&block)
  end
end
