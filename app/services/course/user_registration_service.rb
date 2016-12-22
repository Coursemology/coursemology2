# frozen_string_literal: true
class Course::UserRegistrationService
  # Registers the specified registration.
  #
  # @param [Course::Registration] registration The registration object to be processed.
  # @return [Boolean] True if the registration succeeded. False if the registration failed.
  def register(registration)
    course_user = CourseUser.transaction { create_or_update_registration(registration) }

    succeeded = course_user && !course_user.changed?
    if succeeded && course_user.requested?
      notify_course_staff(registration.course, course_user)
    else
      succeeded
    end
  end

  private

  # Creates the effect of performing the given registration.
  #
  # @param [Course::Registration] registration The registration object to be processed.
  # @return [CourseUser] The Course User which was created or updated from the registration.
  def create_or_update_registration(registration)
    if registration.code.empty?
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
      register_course_user(registration)
    else
      accept_invitation(registration, invitation)
    end
  end

  # Registers the given +user+ for a +course+. This sets the course user to the +requested+
  # state, unless an explicit +workflow_state+ is passed in the +options+.
  #
  # This also sets the given +user+'s state as specified in the +options+ if the user already
  # exists in the database.
  #
  # @param [Course::Registration] registration The registration model containing the course user
  #   parameters.
  # @param [Hash] options Additional options for creating the course user.
  # @return [CourseUser] The Course User object which was created or updated.
  def register_course_user(registration, options = {}.freeze)
    options = options.dup.reverse_merge(course: registration.course, user: registration.user,
                                        updater: registration.user)
    course_user = CourseUser.find_by(course: registration.course, user: registration.user)
    if course_user
      update_course_user(registration, course_user, options)
      course_user
    else
      create_course_user(registration, options)
    end
  end

  # Updates the given +course_user+ with the options specified.
  #
  # @param [Course::Registration] registration The registration model containing the course user
  #   parameters.
  # @param [Hash] options Additional operations for updating the course user.
  # @return [Boolean] True if the course user was updated.
  def update_course_user(registration, course_user, options)
    registration.course_user = course_user
    course_user.update(options)
  end

  # Creates a +course_user+ with the options specified.
  #
  # @param [Course::Registration] registration The registration model containing the course user
  #   parameters.
  # @param [Hash] options Additional operations for updating the course user.
  # @return [CourseUser] The Course User which was built from the registration.
  def create_course_user(registration, options)
    course_user = CourseUser.new(options.reverse_merge!(creator: registration.user))
    course_user.save
    registration.course_user = course_user
  end

  # Claims a given registration code. This sets the course user to the +approved+ state. The
  # correct type of code is deduced from the code itself and used to claim the correct code.
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

  # Claims a given course registration code. This sets the course user to the +approved+ state.
  #
  # @param [Course::Registration] registration The registration model containing the course user
  #   parameters.
  # @return [CourseUser] The Course User object for the given registration, if the code is
  #   valid.
  # @return [nil] If the code is invalid.
  def claim_course_registration_code(registration)
    if registration.course.registration_key == registration.code
      register_course_user(registration, workflow_state: :approved)
    else
      invalid_code(registration)
    end
  end

  # Claims a given user's invitation code. This sets the course user to the +approved+ state.
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
      register_course_user(registration, workflow_state: :approved)
    end
  end

  # Assigns an unclaimed email address to a given user.
  #
  # @param [User::Email] email
  # @param [User] user
  def assign_email_to_user(email, user)
    email.update(user: user) if email.user.nil?
  end

  # Sends an email to the course staff to approve the given course registration request.
  #
  # @param [Course] course The course that the user is registering into.
  # @param [CourseUser] course_user The Course User object who registered.
  # @return [Boolean] True if the staff were successfully notified.
  def notify_course_staff(course, course_user)
    Course::Mailer.user_registered_email(course, course_user).deliver_later
    true
  end
end
