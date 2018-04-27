# frozen_string_literal: true
class Course::UserRegistrationsController < Course::ComponentController
  before_action :ensure_unregistered_user, only: [:create]
  before_action :load_registration
  skip_authorize_resource :course, only: [:create]

  def create # :nodoc:
    @registration.update(registration_params.reverse_merge(course: current_course,
                                                           user: current_user))
    if registration_service.register(@registration)
      create_success
    else
      render 'course/courses/show'
    end
  end

  private

  def registration_params # :nodoc:
    @registration_params ||= params.require(:registration).permit(:code)
  end

  def ensure_unregistered_user
    return unless current_course.course_users.exists?(user: current_user)

    role = t("course.users.role.#{current_course_user.role}")
    message = t('course.users.new.already_registered', role: role)
    redirect_to course_path(current_course), info: message
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

  def create_success # :nodoc:
    success =
      if @registration.course_user.present?
        role = t("course.users.role.#{@registration.course_user.role}")
        t('course.user_registrations.create.registered', role: role)
      else
        t('course.user_registrations.create.requested')
      end

    redirect_to course_path(current_course), success: success
  end

  # @return [Course::UsersComponent]
  # @return [nil] If component is disabled.
  def component
    current_component_host[:course_users_component]
  end
end
