# frozen_string_literal: true

# Provides a service object for inviting users into a course.
class Course::UserInvitationService
  include ParseInvitationConcern
  include ProcessInvitationConcern
  include EmailInvitationConcern

  # Constructor for the user invitation service object.
  #
  # @param [User] current_user The user performing this action.
  # @param [Course] current_course The course to invite users to.
  def initialize(current_user, current_course)
    @current_user = current_user
    @current_course = current_course
    @current_instance = @current_course.instance
  end

  # Invites users to the given course.
  #
  # The result of the transaction is both saving the course as well as validating validity
  # because Rails does not handle duplicate nested attribute uniqueness constraints.
  #
  # @param [Array<Hash>|File|TempFile] users Invites the given users.
  # @return [Array<Integer>|nil] An array containing the the size of new_invitations, existing_invitations,
  #   new_course_users and existing_course_users, duplicate_users respectively if success. nil when fail.
  # @raise [CSV::MalformedCSVError] When the file provided is invalid.
  def invite(users)
    new_invitations = nil
    existing_invitations = nil
    new_course_users = nil
    existing_course_users = nil
    duplicate_users = nil

    success = Course.transaction do
      new_invitations, existing_invitations,
      new_course_users, existing_course_users, duplicate_users = invite_users(users)
      raise ActiveRecord::Rollback unless new_invitations.all?(&:save)
      raise ActiveRecord::Rollback unless new_course_users.all?(&:save)
      true
    end

    send_registered_emails(new_course_users) if success
    send_invitation_emails(new_invitations) if success
    success ? [new_invitations, existing_invitations, new_course_users, existing_course_users, duplicate_users].map(&:size) : nil
  end

  # Resends invitation emails to CourseUsers to the given course.
  # This method disregards CourseUsers that do not have an 'invited' status.
  #
  # @param [Array<Course::UserInvitation>] invitations An array of invitations to be resent.
  # @return [Boolean] True if there were no errors in sending invitations.
  #   If all provided CourseUsers have already registered, method also returns true.
  def resend_invitation(invitations)
    invitations.blank? ? true : send_invitation_emails(invitations)
  end

  private

  # Invites the given users into the course.
  #
  # @param [Array<Hash>|File|TempFile] users Invites the given users.
  # @return
  #   [
  #     Array<(Array<Course::UserInvitation>,
  #     Array<Course::UserInvitation>,
  #     Array<CourseUser>,
  #     Array<CourseUser>)>,
  #     Array<Hash>,
  #   ]
  #   A tuple containing the users newly invited, already invited,
  #     newly registered and already registered, and duplicate users respectively.
  # @raise [CSV::MalformedCSVError] When the file provided is invalid.
  def invite_users(users)
    users, duplicate_users = parse_invitations(users)
    process_invitations(users) + [duplicate_users]
  end
end
