# frozen_string_literal: true
class Course::ExperiencePointsDisbursementController < Course::ComponentController
  include Course::UsersBreadcrumbConcern
  load_resource :experience_points_disbursement, class: Course::ExperiencePointsDisbursement.name

  def new # :nodoc:
    @experience_points_disbursement.build(current_course)
    authorize_resource
  end

  def create # :nodoc:
    @experience_points_disbursement.course = Course.find(params[:course_id])
    authorize_resource
    if @experience_points_disbursement.save
      recipient_count = @experience_points_disbursement.experience_points_records.length
      redirect_to disburse_experience_points_course_users_path(current_course),
                  success: t('.success', count: recipient_count)
    else
      render 'new'
    end
  end

  private

  def experience_points_disbursement_params # :nodoc:
    params.
      require(:experience_points_disbursement).
      permit(:reason, experience_points_records_attributes: [:points_awarded, :course_user_id])
  end

  # Authorizes each newly-built experience points record.
  # Each record has to be checked otherwise it might be possible for a course staff
  # to award experience points to a student from a different course. Only checking the records
  # is also insufficient since access will not be denied if there are no records to authroize.
  def authorize_resource
    authorize!(:disburse, @experience_points_disbursement)
    @experience_points_disbursement.experience_points_records.each do |record|
      authorize!(:create, record)
    end
  end
end
