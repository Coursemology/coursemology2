# frozen_string_literal: true
class Course::Admin::AdminController < Course::Admin::Controller
  def index
    respond_to do |format|
      format.json
    end
  end

  def update
    result = ActiveRecord::Base.transaction do
      current_course.update!(course_setting_params)
      shift_all_items

      true
    end

    if result
      render 'index'
    else
      render json: { errors: current_course.errors }, status: :bad_request
    end
  end

  def destroy
    authorize!(:destroy, current_course)
    if current_course.destroy
      destroy_success
    else
      destroy_failure
    end
  end

  private

  def course_setting_params
    params.require(:course).
      permit(:title, :description, :published, :enrollable, :start_at, :end_at, :logo, :gamified,
             :show_personalized_timeline_features, :default_timeline_algorithm,
             :time_zone, :advance_start_at_duration_days)
  end

  def destroy_success
    head :ok
  end

  def destroy_failure
    render json: { errors: current_course.errors.full_messages.to_sentence }, status: :bad_request
  end

  def shift_all_items
    return if time_offset_params.keys.empty?

    reference_times = current_course.reference_times
    time_offset_days = time_offset_params[:time_offset][:days].to_i
    time_offset_hours = time_offset_params[:time_offset][:hours].to_i
    time_offset_minutes = time_offset_params[:time_offset][:minutes].to_i

    Course::ReferenceTime::TimeOffsetService.shift_all_times(reference_times, time_offset_days, time_offset_hours,
                                                             time_offset_minutes)
  end

  def time_offset_params
    params.require(:course).permit({ time_offset: [:days, :hours, :minutes] })
  end
end
