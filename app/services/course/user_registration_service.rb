class Course::UserRegistrationService
  # Registers the specified registration.
  #
  # @param [Course::Registration] registration The registration object to be processed.
  # @return [bool] True if the registration succeeded. False if the registration failed.
  def register(registration)
    CourseUser.transaction do
      if registration.code.empty?
        register_course_user(registration)
      else
        claim_registration_code(registration)
      end
    end
  end

  private

  # Registers the given +user+ for a +course+. This sets the course user to the +requested+ state.
  #
  # @param [Course::Registration] registration The registration model containing the course user
  #   parameters.
  # @return [bool] True if the creation succeeded.
  def register_course_user(registration)
    course_user = CourseUser.new(course: registration.course, user: registration.user,
                                 creator: registration.user, updater: registration.user)
    registration.course_user = course_user
    course_user.save
  end

  # Claims a given user's registration code. This sets the course user to the +approved+ state.
  #
  # @param [Course::Registration] registration The registration model containing the course user
  #   parameters.
  # @return [bool] True if the creation succeeded.
  def claim_registration_code(registration)
    invitations = load_active_invitations(registration.course)
    invitation = invitations.find_by(invitation_key: registration.code)
    if invitation.nil?
      registration.errors.add(:code, I18n.t('course.user_registrations.create.invalid_code'))
      false
    else
      accept_invitation(registration, invitation)
    end
  end

  # Loads active invitations given a course.
  #
  # @param [Course] course The course to load invitations for.
  # @return [ActiveRecord::CollectionProxy]
  def load_active_invitations(course)
    Course::UserInvitation.joins { course_user }.
      where { course_user.course == course }.
      where { course_user.workflow_state == 'invited' }
  end

  # Accepts the invitation specified, sets the registration's +course_user+ to be that found in
  # the invitation.
  #
  # @param [Course::Registration] registration The registration model containing the course user
  #   parameters.
  # @param [Course::Invitation] invitation The invitation which is to be accepted.
  # @return [bool]
  def accept_invitation(registration, invitation)
    registration.course_user = invitation.course_user
    invitation.course_user.accept!(registration.user)
    invitation.course_user.save
  end
end
