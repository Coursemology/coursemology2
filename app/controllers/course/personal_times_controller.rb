# frozen_string_literal: true
class Course::PersonalTimesController < Course::ComponentController
  include Course::LessonPlan::PersonalizationConcern
  include Course::LessonPlan::LearningRateConcern

  before_action :authorize_personal_times!

  def index
    respond_to do |format|
      format.json do
        return unless params[:user_id].present?

        @course_user ||= CourseUser.find_by(course: @course, id: params[:user_id])
        @learning_rate_record = @course_user.latest_learning_rate_record

        # Only show for assessments and videos
        @items = @course.lesson_plan_items.where(actable_type: [Course::Assessment.name, Course::Video.name]).
                 ordered_by_date_and_title.
                 with_reference_times_for(@course_user, @course).
                 with_personal_times_for(@course_user)

        render 'index'
      end
    end
  end

  def create
    @course_user = CourseUser.find_by(course: @course, id: params[:user_id])
    @item = @course.lesson_plan_items.find(params[:personal_time][:lesson_plan_item_id])
    @personal_time = @item.find_or_create_personal_time_for(@course_user)
    if @personal_time.update(personal_time_params)
      render '_personal_time_list_data', locals: { item: @item }, status: :ok
    else
      render json: { errors: @personal_time.errors.full_messages.to_sentence }, status: :bad_request
    end
  end

  def destroy
    @course_user = CourseUser.find_by(course: @course, id: params[:user_id])
    @personal_time = @course_user.personal_times.find(params[:id])
    if @personal_time.destroy
      head :ok
    else
      render json: { errors: @personal_time.errors.full_messages.to_sentence }, status: :bad_request
    end
  end

  def recompute
    @course_user = CourseUser.find_by(course: @course, id: params[:user_id])
    update_personalized_timeline_for_user(@course_user) if @course_user.present?
    index
  end

  private

  def component
    current_component_host[:course_users_component]
  end

  def authorize_personal_times!
    authorize!(:manage_personal_times, current_course)
  end

  def personal_time_params
    params[:personal_time].permit(:start_at, :bonus_end_at, :end_at, :fixed)
  end
end
