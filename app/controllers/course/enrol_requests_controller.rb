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
    @enrol_request.course = current_course
    if @enrol_request.save
      render '_enrol_request_list_data', locals: { enrol_request: @enrol_request }
    else
      render json: { errors: @enrol_request.errors }, status: :bad_request
    end
  end

  # Approve the given enrolment request and creates the course user.
  def approve
    ActiveRecord::Base.transaction do
      course_user = create_course_user
      if course_user.persisted? && @enrol_request.update(approve: true)
        Course::Mailer.user_added_email(course_user).deliver_later
        approve_success
      else
        approve_failure(course_user)
      end
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
