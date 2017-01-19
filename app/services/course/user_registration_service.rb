# frozen_string_literal: true
class Course::UserRegistrationService
  # Registers the specified registration.
  #
  # @param [Course::Registration] registration The registration object to be processed.
  # @return [Boolean] True if the registration succeeded. False if the registration failed.
  def register(registration)
    course_user_or_request = create_or_update_registration(registration)

    succeeded = course_user_or_request && course_user_or_request.persisted?
    if succeeded && registration.enrol_request.present?
      notify_course_staff(course_user_or_request)
    else
      succeeded
    end
  end

  private

  # Creates the effect of performing the given registration.
  #
  # @param [Course::Registration] registration The registration object to be processed.
  # @return [CourseUser|Course::EnrolRequest] The Course User or EnrolRequest which was created
  # from the registration.
  def create_or_update_registration(registration)
    if registration.code.blank?
      register_without_registration_code(registration)
    else
      claim_registration_code(registration)
    end
  end

  # If the user has been invited using one of his registered email addresses, automatically
  # trigger acceptance of the invitation. Otherwise, proceed to do new course user registration.
  #
  # @param [Course::Registration] registration The registration object to be processed.
  # @return [CourseUser] The Course User which was created or updated from the registration.
  def register_without_registration_code(registration)
    invitation = registration.course.invitations.unconfirmed.for_user(registration.user)
    if invitation.nil?
      find_or_create_enrol_request!(registration)
    else
      accept_invitation(registration, invitation)
    end
  end

  # Find or create a enrol_request.
  #
  # @param [Course::Registration] registration The registration model containing the course and user
  #   parameters.
  # @return [CourseUser] The Course User object which was found or created.
  def find_or_create_enrol_request!(registration)
    registration.enrol_request =
      Course::EnrolRequest.find_or_create_by!(course: registration.course, user: registration.user)
  end

  # Find or create a course_user.
  #
  # @param [Course::Registration] registration The registration model containing the course and user
  #   parameters.
  # @param [String] name The name of the course_user to be set.
  # @return [CourseUser] The Course User object which was found or created.
  def find_or_create_course_user!(registration, name = nil)
    name ||= registration.user.name

    registration.course_user =
      CourseUser.find_or_create_by!(course: registration.course, user: registration.user,
                                    name: name)
  end

  # Claims a given registration code. The correct type of code is deduced from the code itself and
  # used to claim the correct code.
  #
  # @param [Course::Registration] registration The registration model containing the course user
  #   parameters.
  # @return [CourseUser] The Course User object for the given registration, if the code is
  #   valid.
  # @return [nil] If the code is invalid.
  def claim_registration_code(registration)
    code = registration.code
    if code.blank?
      nil
    elsif code[0] == 'C'
      claim_course_registration_code(registration)
    elsif code[0] == 'I'
      claim_course_invitation_code(registration)
    end
  end

  # Claims a given course registration code.
  #
  # @param [Course::Registration] registration The registration model containing the course user
  #   parameters.
  # @return [CourseUser] The Course User object for the given registration, if the code is
  #   valid.
  # @return [nil] If the code is invalid.
  def claim_course_registration_code(registration)
    if registration.course.registration_key == registration.code
      find_or_create_course_user!(registration)
    else
      invalid_code(registration)
    end
  end

  # Claims a given user's invitation code.
  #
  # @param [Course::Registration] registration The registration model containing the course user
  #   parameters.
  # @return [CourseUser] The Course User object for the given registration, if the code is
  #   valid.
  # @return [nil] If the code is invalid.
  def claim_course_invitation_code(registration)
    invitations = registration.course.invitations.unconfirmed
    invitation = invitations.find_by(invitation_key: registration.code)
    if invitation.nil?
      invalid_code(registration)
    else
      accept_invitation(registration, invitation)
    end
  end

  # Given a registration model, sets the invalid code error on the model and returns false.
  #
  # @param [Course::Registration] registration The registration model containing the course user
  #   parameters.
  # @return [nil]
  def invalid_code(registration)
    registration.errors.add(:code, I18n.t('course.user_registrations.create.invalid_code'))
    nil
  end

  # Accepts the invitation specified, sets the registration's +course_user+ to be that found in
  # the invitation.
  #
  # @param [Course::Registration] registration The registration model containing the course user
  #   parameters.
  # @param [Course::Invitation] invitation The invitation which is to be accepted.
  # @return [CourseUser] The Course User object for the given registration, if the code is
  #    valid.
  # @return [nil] If the code is invalid.
  def accept_invitation(registration, invitation)
    CourseUser.transaction do
      invitation.confirm!
      find_or_create_course_user!(registration, invitation.name)
    end
  end

  # Sends an email to the course staff to approve the given course enrol request.
  #
  # @param [Course::EnrolRequest] enrol_request The user enrol request.
  # @return [Boolean] True if the staff were successfully notified.
  def notify_course_staff(enrol_request)
    Course::Mailer.user_registered_email(enrol_request).deliver_later
    true
  end
end
