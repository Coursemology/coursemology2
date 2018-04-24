# frozen_string_literal: true
class Course::EnrolRequestsController < Course::ComponentController
  skip_authorize_resource :course, only: [:create, :destroy]
  load_and_authorize_resource :enrol_request, through: :course, class: Course::EnrolRequest.name

  def index
    @enrol_requests = @enrol_requests.includes(:user)
  end

  def create
    @enrol_request.user = current_user
    if @enrol_request.save
      Course::Mailer.user_enrol_requested_email(@enrol_request).deliver_later
      redirect_to course_path(current_course), success: t('.success')
    else
      redirect_to course_path(current_course),
                  danger: @enrol_request.errors.full_messages.to_sentence
    end
  end

  # Allow users to withdraw their requests to register for a course that are pending
  # approval/rejection.
  def destroy
    if @enrol_request.destroy
      redirect_back fallback_location: course_path(current_course), success: t('.success')
    else
      redirect_back fallback_location: course_path(current_course),
                    danger: @enrol_request.errors.full_messages.to_sentence
    end
  end

  # Approve the given role request and creates the course user.
  def approve
    course_user = create_course_user
    if course_user.persisted?
      flash.now[:success] = t('.success', name: course_user.name, role: course_user.role)
      Course::Mailer.user_added_email(current_course, course_user).deliver_later
    else
      flash.now[:danger] = course_user.errors.full_messages.to_sentence
    end
  end

  private

  def create_course_user
    course_user = CourseUser.new(course_user_params.
      reverse_merge(course: current_course, user_id: @enrol_request.user_id))

    CourseUser.transaction do
      raise ActiveRecord::Rollback unless @enrol_request.destroy && course_user.save
    end

    course_user
  end

  def course_user_params
    params.require(:course_user).permit(:name, :role, :phantom).to_h
  end

  # @return [Course::UsersComponent]
  # @return [nil] If component is disabled.
  def component
    current_component_host[:course_users_component]
  end
end
