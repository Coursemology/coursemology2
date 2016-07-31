# frozen_string_literal: true
class Course::ExperiencePoints::ForumDisbursementController <
  Course::ExperiencePoints::DisbursementController
  def create # :nodoc:
    if @disbursement.save
      redirect_to forum_disbursement_course_users_path(current_course, @disbursement.params_hash),
                  success: t('.success', count: recipient_count)
    else
      render 'new'
    end
  end

  private

  def load_resource # :nodoc:
    @disbursement ||= Course::ExperiencePoints::ForumDisbursement.new(disbursement_params)
  end

  def disbursement_params # :nodoc:
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
