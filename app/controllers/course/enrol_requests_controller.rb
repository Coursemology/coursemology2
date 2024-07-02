# frozen_string_literal: true
class Course::EnrolRequestsController < Course::ComponentController
  include Signals::EmissionConcern

  skip_authorize_resource :course, only: [:create, :destroy]
  load_and_authorize_resource :enrol_request, through: :course, class: 'Course::EnrolRequest'

  signals :enrol_requests, after: [:index, :approve, :reject]

  def index
    @enrol_requests = @enrol_requests.includes(:confirmer, user: :emails)
  end

  def create
    @enrol_request.user = current_user
    if @enrol_request.save
      Course::Mailer.user_enrol_requested_email(@enrol_request).deliver_later
      render json: { id: @enrol_request.id }, status: :ok
    else
      render json: { errors: @enrol_request.errors.full_messages.to_sentence }, status: :bad_request
    end
  end

  # Allow users to withdraw their requests to register for a course that are pending
  # approval/rejection.
  def destroy
    if @enrol_request.destroy
      head :ok
    else
      render json: { errors: @enrol_request.errors.full_messages.to_sentence }, status: :bad_request
    end
  end

  # Approve the given enrolment request and creates the course user.
  def approve
    course_user = create_course_user
    if course_user.persisted?
      Course::Mailer.user_added_email(course_user).deliver_later
      approve_success
    else
      approve_failure(course_user)
    end
  end

  def reject
    if @enrol_request.update(reject: true)
      Course::Mailer.user_rejected_email(current_course, @enrol_request.user).deliver_later
      reject_success
    else
      reject_failure
    end
  end

  private

  def create_course_user
    course_user = CourseUser.new(course_user_params.
      reverse_merge(course: current_course, user_id: @enrol_request.user_id,
                    timeline_algorithm: current_course.default_timeline_algorithm))

    CourseUser.transaction do
      raise ActiveRecord::Rollback unless course_user.save && @enrol_request.update(approve: true)
    end

    course_user
  end

  def course_user_params
    params.require(:course_user).permit(:name, :role, :phantom, :timeline_algorithm).to_h
  end

  # @return [Course::UsersComponent]
  # @return [nil] If component is disabled.
  def component
    current_component_host[:course_users_component]
  end

  def approve_success
    respond_to do |format|
      format.json { render '_enrol_request_list_data', locals: { enrol_request: @enrol_request }, status: :ok }
    end
  end

  def approve_failure(course_user)
    respond_to do |format|
      format.json { render json: { errors: course_user.errors.full_messages.to_sentence }, status: :bad_request }
    end
  end

  def reject_success
    respond_to do |format|
      format.json { render '_enrol_request_list_data', locals: { enrol_request: @enrol_request }, status: :ok }
    end
  end

  def reject_failure
    respond_to do |format|
      format.json { render json: { errors: @enrol_request.errors.full_messages.to_sentence }, status: :bad_request }
    end
  end
end
