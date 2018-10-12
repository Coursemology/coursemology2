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

  def invite(users)
    new_invitations = nil
    existing_invitations = nil
    new_instance_users = nil
    existing_instance_users = nil

    success = Instance.transaction do
      new_invitations, existing_invitations, new_instance_users, existing_instance_users = invite_users(users)
      raise ActiveRecord::Rollback unless new_invitations.all?(&:save)
      raise ActiveRecord::Rollback unless new_instance_users.all?(&:save)
      true
    end

    send_registered_emails(new_instance_users) if success
    send_invitation_emails(new_invitations) if success
    success ? [new_invitations, existing_invitations, new_instance_users, existing_instance_users].map(&:size) : nil
  end

  def invite_users(users)
    users = parse_invitations(users)
    process_invitations(users)
  end
end
