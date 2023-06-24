# frozen_string_literal: true
class System::Admin::Instance::CoursesController < System::Admin::Instance::Controller
  load_and_authorize_resource :course, through: :instance

  def index
    respond_to do |format|
      format.html { render 'system/admin/instance/admin/index' }
      format.json do
        preload_courses
      end
    end
  end

  def destroy
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

  def preload_courses # rubocop:disable Metrics/AbcSize
    @courses = @instance.courses.search(search_param).calculated(:active_user_count, :user_count)
    @courses = @courses.active_in_past_7_days if ActiveRecord::Type::Boolean.new.cast(params[:active])

    @courses = @courses.ordered_by_title
    @courses_count = @courses.count.is_a?(Hash) ? @courses.count.count : @courses.count

    @owner_preload_service = Course::CourseOwnerPreloadService.new(@courses.map(&:id))
  end
end
