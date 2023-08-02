# frozen_string_literal: true
class Course::ExperiencePoints::DisbursementController < Course::ComponentController
  before_action :load_resource
  before_action :authorize_resource

  def new
    respond_to do |format|
      format.json { render 'new' }
    end
  end

  def create
    if @disbursement.save
      render json: { count: recipient_count }, status: :ok
    else
      render json: { errors: @disbursement.errors }, status: :bad_request
    end
  end

  private

  def load_resource
    @disbursement ||= Course::ExperiencePoints::Disbursement.new(disbursement_params)
  end

  def disbursement_params
    case action_name
    when 'new'
      params.permit(:group_id)
    when 'create'
      params.
        require(:experience_points_disbursement).
        permit(:reason, experience_points_records_attributes: [:points_awarded, :course_user_id])
    end.reverse_merge(course: current_course)
  end

  # Authorizes each newly-built experience points record.
  # Each record has to be checked otherwise it might be possible for a course staff
  # to award experience points to a student from a different course. Only checking the records
  # is also insufficient since access will not be denied if there are no records to authroize.
  def authorize_resource
    authorize!(:disburse, @disbursement)
    @disbursement.experience_points_records.each do |record|
      authorize!(:create, record)
    end
  end

  def recipient_count
    @disbursement.experience_points_records.length
  end

  # @return [Course::ExperiencePointsComponent]
  # @return [nil] If component is disabled.
  def component
    current_component_host[:course_experience_points_component]
  end
end
