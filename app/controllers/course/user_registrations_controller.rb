# frozen_string_literal: true
class Course::UserRegistrationsController < Course::ComponentController
  before_action :ensure_unregistered_user, only: [:create]
  before_action :load_registration
  skip_authorize_resource :course, only: [:create]

  def create
    @registration.update(registration_params.reverse_merge(course: current_course,
                                                           user: current_user))
    if registration_service.register(@registration)
      head :ok
    else
      render json: { errors: @registration.errors }, status: :bad_request
    end
  end

  private

  def registration_params
    @registration_params ||= params.require(:registration).permit(:code)
  end

  def ensure_unregistered_user
    return unless current_course.course_users.exists?(user: current_user)

    role = t("errors.course.users.role.#{current_course_user.role}")
    message = t('errors.course.users.already_registered', role: role)

    render json: { errors: message }, status: :conflict
  end

  def load_registration
    @registration = Course::Registration.new
  end

  # Constructs the registration service object for the current object.
  #
  # @return [Course::UserRegistrationService]
  def registration_service
    @registration_service ||= Course::UserRegistrationService.new
  end

  # @return [Course::UsersComponent]
  # @return [nil] If component is disabled.
  def component
    current_component_host[:course_users_component]
  end
end
