# frozen_string_literal: true

# Provides a service object for inviting users into a course.
class Course::UserInvitationService
  include ParseInvitationConcern
  include ProcessInvitationConcern
  include EmailInvitationConcern

  class ExternalIdConflict < StandardError
    attr_reader :external_id

    def initialize(external_id)
      @external_id = external_id
      super("External ID '#{external_id}' is already used by another member")
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
  # @return [Array<Integer>|nil] An array containing the size of new_invitations, existing_invitations,
  #   new_course_users, existing_course_users, failed_users, pending_invitation_updates,
  #   pending_course_user_updates respectively if success. nil when fail.
  # @raise [CSV::MalformedCSVError] When the file provided is invalid.
  def invite(users)
    result = nil

    success = Course.transaction do
      result = invite_users(users)
      save_invitation_records!(result)
      true
    end

    return unless success

    new_invitations, _, new_course_users, = result
    send_registered_emails(new_course_users)
    send_invitation_emails(new_invitations)
    result
  end

  # Atomically updates external IDs for course users and/or invitations.
  #
  # @param [Array<Hash>] updates Each hash must contain :type ('course_user' or 'invitation'),
  #   :id, and :external_id (blank value clears it).
  # @raise [ExternalIdConflict] if any new external_id is already taken by another member.
  # rubocop:disable Metrics/AbcSize
  def update_external_ids(updates)
    course_user_updates = updates.select { |u| u[:type].to_s == 'course_user' }
    invitation_updates = updates.select { |u| u[:type].to_s == 'invitation' }

    course_users = @current_course.course_users.where(id: course_user_updates.map { |u| u[:id] }).index_by(&:id)
    invitations = @current_course.invitations.where(id: invitation_updates.map { |u| u[:id] }).index_by(&:id)

    taken = external_ids_taken_outside(course_users.keys, invitations.keys)

    Course.transaction do
      apply_external_id_update(course_user_updates, course_users, taken)
      apply_external_id_update(invitation_updates, invitations, taken)
    end
  end
  # rubocop:enable Metrics/AbcSize

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

  def external_ids_taken_outside(excluded_course_user_ids, excluded_invitation_ids)
    course_ext_ids = @current_course.course_users.
                     where.not(id: excluded_course_user_ids).
                     where.not(external_id: nil).pluck(:external_id)
    invitation_ext_ids = Course::UserInvitation.unconfirmed.
                         where(course: @current_course).
                         where.not(id: excluded_invitation_ids).
                         where.not(external_id: nil).pluck(:external_id)
    Set.new(course_ext_ids + invitation_ext_ids)
  end

  def apply_external_id_update(updates, records_by_id, taken)
    updates.each do |update|
      record = records_by_id[update[:id]]
      next unless record

      value = update[:external_id].presence
      raise ExternalIdConflict, value if value && taken.include?(value)

      taken.add(value) if value
      record.update!(external_id: value)
    end
  end

  def save_invitation_records!(result)
    new_invitations, _, new_course_users, = result
    all_records = new_invitations + new_course_users
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
    @pending_invitation_updates = []
    @pending_course_user_updates = []
    process_invitations(unique_users) + [@failed_users, @pending_invitation_updates, @pending_course_user_updates]
  end
end
