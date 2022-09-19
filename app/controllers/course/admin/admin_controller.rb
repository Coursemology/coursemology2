# frozen_string_literal: true
class Course::Admin::AdminController < Course::Admin::Controller
  def index
    respond_to do |format|
      format.html { render 'course/admin/index' }
      format.json
    end
  end

  def update
    if current_course.update(course_setting_params)
      render 'index'
    else
      render json: { errors: current_course.errors }, status: :bad_request
    end
  end

  def destroy
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
end
