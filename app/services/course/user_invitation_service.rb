# frozen_string_literal: true

# Provides a service object for inviting users into a course.
class Course::UserInvitationService
  include ParseInvitationConcern
  include ProcessInvitationConcern
  include EmailInvitationConcern

  class PendingExternalIdUpdates < StandardError
    attr_reader :pending_invitation_updates, :pending_course_user_updates

    def initialize(pending_invitation_updates:, pending_course_user_updates:)
      @pending_invitation_updates = pending_invitation_updates
      @pending_course_user_updates = pending_course_user_updates
      super('Pending external ID updates require confirmation')
    end
  end

  # Constructor for the user invitation service object.
  #
  # @param [CourseUser|nil] current_course_user The course user performing this action.
  # @param [User] current_user The user performing this action.
  # @param [Course] current_course The user performing this action for which course.
  def initialize(current_course_user, current_user, current_course)
    @current_course_user = current_course_user
    @current_user = current_user
    @current_course = current_course
    @current_instance = current_course.instance
  end

  # Invites users to the given course.
  #
  # The result of the transaction is both saving the course as well as validating validity
  # because Rails does not handle duplicate nested attribute uniqueness constraints.
  #
  # @param [Array<Hash>|File|TempFile] users Invites the given users.
  # @return [Array|nil] An array of [new_invitations, existing_invitations, new_course_users,
  #   existing_course_users, failed_users, updated_invitations, updated_course_users]
  #   if success. nil when fail.
  # @raise [CSV::MalformedCSVError] When the file provided is invalid.
  def invite(users, external_id_resolution: nil)
    @resolution = external_id_resolution&.to_sym
    result = nil

    success = Course.transaction do
      result = invite_users(users)
      raise_if_pending_external_id_updates!
      save_invitation_records!(result)
      true
    end

    return unless success

    new_invitations, _, new_course_users, = result
    send_registered_emails(new_course_users)
    send_invitation_emails(new_invitations)
    result
  end

  def blank_header_warning
    @blank_header_warning || false
  end

  # Resends invitation emails to CourseUsers to the given course.
  # This method disregards CourseUsers that do not have an 'invited' status.
  #
  # @param [Array<Course::UserInvitation>] invitations An array of invitations to be resent.
  # @return [Boolean] True if there were no errors in sending invitations.
  #   If all provided CourseUsers have already registered, method also returns true.
  def resend_invitation(invitations)
    invitations.blank? || send_invitation_emails(invitations)
  end

  private

  def raise_if_pending_external_id_updates!
    return unless @pending_invitation_updates.any? || @pending_course_user_updates.any?

    raise PendingExternalIdUpdates.new(
      pending_invitation_updates: @pending_invitation_updates,
      pending_course_user_updates: @pending_course_user_updates
    )
  end

  def save_invitation_records!(result)
    new_invitations, _, new_course_users, _, _, updated_invitations, updated_course_users = result
    all_records = updated_invitations.map { |u| u[:record] } +
                  updated_course_users.map { |u| u[:record] } +
                  new_invitations + new_course_users
    raise ActiveRecord::Rollback unless all_records.all?(&:save)
  end

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
    user_hashes = parse_invitations(users)
    augment_user_objects(user_hashes)
    existing_account_emails = user_hashes.
                              select { |u| u[:user].present? }.
                              to_set { |u| u[:email].downcase }
    unique_users, parse_duplicates = partition_unique_users(user_hashes, existing_account_emails)
    @failed_users = parse_duplicates
    @updated_invitations = []
    @updated_course_users = []
    @pending_invitation_updates = []
    @pending_course_user_updates = []
    process_invitations(unique_users) + [@failed_users, @updated_invitations, @updated_course_users]
  end
end
