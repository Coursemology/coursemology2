# frozen_string_literal: true
class System::Admin::CoursesController < System::Admin::Controller
  around_action :unscope_resources

  def index
    respond_to do |format|
      format.html { render 'system/admin/admin/index' }
      format.json do
        preload_courses
      end
    end
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

  def preload_courses
    @courses = Course.includes(:instance).search(search_param).calculated(:active_user_count, :user_count)
    @courses = @courses.active_in_past_7_days if ActiveRecord::Type::Boolean.new.cast(params[:active])

    @courses = @courses.ordered_by_title
    @courses_count = @courses.count.is_a?(Hash) ? @courses.count.count : @courses.count

    @owner_preload_service = Course::CourseOwnerPreloadService.new(@courses.map(&:id))
  end
end
