# frozen_string_literal: true
class Course::UserRegistrationService
  # Registers the specified registration.
  #
  # @param [Course::Registration] registration The registration object to be processed.
  # @return [Boolean] True if the registration succeeded. False if the registration failed.
  def register(registration)
    course_user = create_or_update_registration(registration)
    course_user.nil? ? false : course_user.persisted?
  end

  private

  # Creates the effect of performing the given registration.
  #
  # @param [Course::Registration] registration The registration object to be processed.
  # @return [CourseUser] The Course User created from the registration.
  # @return [nil] If registration was unsuccessful.
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
  # @return [CourseUser|nil] The Course User which was created or updated from the registration,
  #   nil will be returned if there's no existing invitation to the user.
  def register_without_registration_code(registration)
    invitation = registration.course.invitations.unconfirmed.for_user(registration.user)
    if invitation.nil?
      registration.errors.add(:code, :blank)
      nil
    else
      accept_invitation(registration, invitation)
    end
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
    else
      invalid_code(registration)
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
    invitations = registration.course.invitations
    invitation = invitations.find_by(invitation_key: registration.code)
    if invitation.nil?
      invalid_code(registration)
    elsif invitation.confirmed?
      code_taken(registration, invitation)
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

  def code_taken(registration, invitation)
    confirmed_by = invitation.confirmer
    if confirmed_by
      registration.errors.
        add(:code, I18n.t('course.user_registrations.create.code_taken_with_email', email: confirmed_by.email))
    else
      registration.errors.add(:code, I18n.t('course.user_registrations.create.code_taken'))
    end
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
      invitation.confirm!(confirmer: registration.user)
      find_or_create_course_user!(registration, invitation.name)
    end
  end
end
