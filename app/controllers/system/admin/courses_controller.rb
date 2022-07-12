# frozen_string_literal: true
class System::Admin::CoursesController < System::Admin::Controller
  around_action :unscope_resources
  add_breadcrumb :index, :admin_courses_path

  def index
    respond_to do |format|
      format.html { render 'system/admin/admin/index' }
      format.json do
        @courses = Course.includes(:instance).search(search_param).calculated(:active_user_count, :user_count)
        if params[:active].present?
          @courses = @courses.active_in_past_7_days.order('active_user_count DESC, user_count')
        end
        @courses = @courses.ordered_by_title
        @courses_count = @courses.count.is_a?(Hash) ? @courses.count.count : @courses.count
        @courses = @courses.paginated(new_page_params)

        @owner_preload_service = Course::CourseOwnerPreloadService.new(@courses.map(&:id))
      end
    end
  end

  def destroy
    @course ||= Course.find(params[:id])

    if @course.destroy
      head :ok
    else
      render json: { errors: @course.errors }, status: :bad_request
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
