# frozen_string_literal: true
class Course::DuplicationsController < Course::ComponentController
  before_action :authorize_duplication

  def show; end

  def create
    # When selectable duplication is implemented, pass in additional arrays for all_objects
    # and selected_objects
    job = Course::DuplicationJob.perform_later(current_course, duplication_job_options).job
    respond_to do |format|
      format.json { render partial: 'jobs/submitted', locals: { job: job } }
    end
  end

  protected

  def authorize_duplication
    authorize!(:duplicate_from, current_course)
    return if instance_params == current_tenant.id

    destination_tenant = Instance.find(instance_params)

    authorize!(:duplicate_across_instances, destination_tenant)
  end

  private

  def create_duplication_params
    params.require(:duplication).permit(:new_start_at, :new_title, :destination_instance_id)
  end

  def instance_params
    params.require(:duplication).require(:destination_instance_id)
  end

  # Construct the options to be sent to the duplication job.
  # This includes new_course's start_date and title, and current_user.
  #
  # @return [Hash] Hash of options to be sent to the duplication job
  def duplication_job_options
    create_duplication_params.merge(current_user: current_user).to_h
  end

  # @return [Course::DuplicationComponent]
  # @return [nil] If component is disabled.
  def component
    current_component_host[:course_duplication_component]
  end
end
