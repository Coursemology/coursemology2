# frozen_string_literal: true
class Course::ExperiencePoints::ForumDisbursementController <
  Course::ExperiencePoints::DisbursementController
  def create
    if @disbursement.save
      render json: { count: recipient_count }, status: :ok
    else
      render json: { errors: @disbursement.errors }, status: :bad_request
    end
  end

  private

  def load_resource
    @disbursement ||= Course::ExperiencePoints::ForumDisbursement.new(disbursement_params)
  end

  def disbursement_params
    case action_name
    when 'new'
      new_disbursement_params
    when 'create'
      create_disbursement_params
    end.reverse_merge(course: current_course)
  end

  def new_disbursement_params
    if params[:experience_points_forum_disbursement]
      params.require(:experience_points_forum_disbursement).
        permit(:start_time, :end_time, :weekly_cap)
    else
      {}
    end
  end

  def create_disbursement_params
    params.
      require(:experience_points_forum_disbursement).
      permit(:start_time, :end_time, :weekly_cap, :reason,
             experience_points_records_attributes: [:points_awarded, :course_user_id])
  end
end
