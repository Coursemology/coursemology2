# frozen_string_literal: true
class Course::DuplicationsController < Course::ComponentController
  before_action :authorize_duplication

  def show; end

  def create
    # When selectable duplication is implemented, pass in additional arrays for all_objects
    # and selected_objects
    job = Course::DuplicationJob.perform_later(current_course, duplication_job_options).job
    respond_to do |format|
      format.html { redirect_to(job_path(job)) }
      format.json { render json: { redirect_url: job_path(job) } }
    end
  end

  protected

  def authorize_duplication
    authorize!(:duplicate_from, current_course)
  end

  private

  def create_duplication_params # :nodoc
    params.require(:duplication).permit(:new_start_at, :new_title)
  end

  # Construct the options to be sent to the duplication job.
  # This includes new_course's start_date and title, and current_user.
  #
  # @return [Hash] Hash of options to be sent to the duplication job
  def duplication_job_options
    create_duplication_params.merge(current_user: current_user).to_h
  end
end
