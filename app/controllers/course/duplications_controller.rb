# frozen_string_literal: true
class Course::DuplicationsController < Course::ComponentController
  before_action :authorize_duplication

  def show; end

  def create
    # when selectable duplication is implemented, pass in additional arrays for all_objects
    # and selected_objects
    job = Course::DuplicationJob.perform_later(current_course, current_user,
                                               create_duplication_params).job
    respond_to do |format|
      format.html { redirect_to(job_path(job)) }
      format.json { render json: { redirect_url: job_path(job) } }
    end
  end

  protected

  def authorize_duplication
    authorize!(:duplicate, current_course)
  end

  private

  def create_duplication_params # :nodoc
    params.require(:duplication).permit(:new_course_start_date, :new_course_title)
  end
end
