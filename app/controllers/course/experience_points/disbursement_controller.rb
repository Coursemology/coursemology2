# frozen_string_literal: true
class Course::ExperiencePoints::DisbursementController < Course::ComponentController
  include Course::UsersBreadcrumbConcern
  before_action :load_resource
  before_action :authorize_resource

  def new # :nodoc:
  end

  def create # :nodoc:
    if @disbursement.save
      redirect_to disburse_experience_points_course_users_path(current_course),
                  success: t('.success', count: recipient_count)
    else
      render 'new'
    end
  end

  private

  def load_resource # :nodoc:
    @disbursement ||= Course::ExperiencePoints::Disbursement.new(disbursement_params)
  end

  def disbursement_params # :nodoc:
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
