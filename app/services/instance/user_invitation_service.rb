# frozen_string_literal: true
# Provides a service object for inviting users into an instance.
class Instance::UserInvitationService
  include ParseInvitationConcern
  include ProcessInvitationConcern
  include EmailInvitationConcern

  # Constructor for the user invitation service object.
  #
  # @param [User] current_user The user performing this action.
  # @param [Instance] current_instance The instance to invite users to.
  def initialize(current_user, current_instance)
    @current_user = current_user
    @current_instance = current_instance
  end

  # Invites users to the given Instance.
  #
  # The result of the transaction is both saving the instance as well as validating validity
  # because Rails does not handle duplicate nested attribute uniqueness constraints.
  #
  # @param [Array<Hash>|File|TempFile] users Invites the given users.
  # @return [Array<Integer>|nil] An array containing the the size of new_invitations, existing_invitations,
  #   new_instance_users and existing_instance_users respectively if success. nil when fail.
  # @raise [CSV::MalformedCSVError] When the file provided is invalid.
  def invite(users)
    new_invitations = nil
    existing_invitations = nil
    new_instance_users = nil
    existing_instance_users = nil
    duplicate_users = nil

    success = Instance.transaction do
      new_invitations, existing_invitations,
      new_instance_users, existing_instance_users, duplicate_users = invite_users(users)
      raise ActiveRecord::Rollback unless new_invitations.all?(&:save)
      raise ActiveRecord::Rollback unless new_instance_users.all?(&:save)
      true
    end

    send_registered_emails(new_instance_users) if success
    send_invitation_emails(new_invitations) if success
    invitations = [new_invitations, existing_invitations, new_instance_users, existing_instance_users, duplicate_users]
    success ? invitations.map(&:size) : nil
  end

  def resend_invitation(invitations)
    invitations.blank? ? true : send_invitation_emails(invitations)
  end

  # Invites the given users into the instance.
  #
  # @param [Array<Hash>|File|TempFile] users Invites the given users.
  # @return
  #   [
  #     Array<(Array<Instance::UserInvitation>,
  #     Array<Instance::UserInvitation>,
  #     Array<InstanceUser>,
  #     Array<InstanceUser>)>,
  #     Array<Hash>,
  #   ]
  #   A tuple containing the users newly invited, already invited,
  #     newly registered, already registered, and duplicate users respectively.
  # @raise [CSV::MalformedCSVError] When the file provided is invalid.
  def invite_users(users)
    users, duplicate_users = parse_invitations(users)
    process_invitations(users) + [duplicate_users]
  end
end
