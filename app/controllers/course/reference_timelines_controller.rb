# frozen_string_literal: true
class Course::ReferenceTimelinesController < Course::ComponentController
  load_and_authorize_resource :reference_timeline, through: :course

  def index
    @timelines = @reference_timelines.includes(:reference_times, :course_users)

    # TODO: [PR#5491] Allow timelines management for items other than assessments
    @items = current_course.lesson_plan_items.
             where(actable_type: Course::Assessment.name).
             order(:title).
             includes(:reference_times)
  end

  def create
    if @reference_timeline.save
      render partial: 'reference_timeline', locals: { timeline: @reference_timeline }
    else
      render json: { errors: @reference_timeline.errors.full_messages.to_sentence }, status: :bad_request
    end
  end

  def update
    if @reference_timeline.update(reference_timeline_params)
      head :ok
    else
      render json: { errors: @reference_timeline.errors.full_messages.to_sentence }, status: :bad_request
    end
  end

  def destroy
    @alternative_timeline_id = destroy_params[:revert_to]
    revert_course_users_to_alternative_timeline if @alternative_timeline_id.present?

    ActiveRecord::Base.transaction do
      if @updated_course_users.present?
        CourseUser.import! @updated_course_users, on_duplicate_key_update: [:reference_timeline_id]
        @reference_timeline.course_users.reload
      end

      @reference_timeline.destroy!
      head :ok
    end
  rescue ActiveRecord::InvalidForeignKey # @alternative_timeline_id is invalid
    head :bad_request
  rescue StandardError
    render json: { errors: @reference_timeline.errors.full_messages.to_sentence }, status: :bad_request
  end

  private

  def reference_timeline_params
    params.require(:reference_timeline).permit(:title, :weight)
  end

  def revert_course_users_to_alternative_timeline
    @updated_course_users = []

    @reference_timeline.course_users.each do |course_user|
      course_user.reference_timeline_id = (@alternative_timeline_id == 'default') ? nil : @alternative_timeline_id
      @updated_course_users << course_user
    end
  end

  def destroy_params
    params.permit(:revert_to)
  end

  def component
    current_component_host[:course_multiple_reference_timelines_component]
  end
end
