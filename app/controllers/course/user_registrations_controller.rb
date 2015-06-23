class Course::UserRegistrationsController < Course::ComponentController
  before_action :ensure_unregistered_user, only: [:create]
  before_action :authorize_register!
  before_action :load_registration

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

  # Prevents registration to the course unless it is open for registration.
  def authorize_register!
    authorize!(:register, current_course)
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
    role = t("course.users.role.#{@registration.course_user.role}")
    success =
      if @registration.course_user.approved?
        t('course.user_registrations.create.registered', role)
      else
        t('course.user_registrations.create.requested', role)
      end

    redirect_to course_path(current_course), success: success
  end
end
