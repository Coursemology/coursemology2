# frozen_string_literal: true
# This concern deals with the creation of user invitations.
class Instance::UserInvitationService; end
module Instance::UserInvitationService::ProcessInvitationConcern
  extend ActiveSupport::Autoload

  private

  # Processes the invites of the given users into the instance.
  #
  # @param [Array<Hash{Symbol=>String}>] users A mutable array of users to add.
  #   Each hash must have three attributes:
  #     the +:name+,
  #     the +:email+ of the user to add,
  #     the intended +:role+ in the instance.
  #   The provided +emails+ are NOT case sensitive.
  # @return
  #   [Array<(Array<Instance::UserInvitation>,
  #           Array<Instance::UserInvitation>,
  #           Array<InstanceUser>,
  #           Array<InstanceUser>
  #   )>]
  #   A tuple containing the users newly invited, already invited, newly registered and already registered respectively.
  def process_invitations(users)
    augment_user_objects(users)
    existing_users, new_users = users.partition { |user| user[:user].present? }

    [*invite_new_users(new_users), *add_existing_users(existing_users)]
  end

  # Given an array of hashes containing the email address and name of a user to invite, finds the
  # appropriate +User+ object and mutates each hash to have the appropriate user if the user exists.
  #
  # @param [Array<Hash{Symbol=>String}] users The array of hashes to mutate.
  # @return [void]
  def augment_user_objects(users)
    email_user_mapping = find_existing_users(users.map { |user| user[:email] })
    users.each { |user| user[:user] = email_user_mapping[user[:email]] }
  end

  # Given a list of email addresses, returns a Hash containing the mappings from email addresses
  # to users.
  #
  # @param [Array<String>] email_addresses An array of email addresses to query.
  # @return [Hash{String=>User}] The mapping from email address to users.
  def find_existing_users(email_addresses)
    found_users = User.with_email_addresses(email_addresses)

    found_users.each.flat_map do |user|
      user.emails.map { |user_email| [user_email.email, user] }
    end.to_h
  end

  # Adds existing users to the instance.
  #
  # @param [Array<Hash>] users The user descriptions to add to the instance.
  # @return [Array(Array<InstanceUser>, Array<InstanceUser>)]
  #   A tuple containing the list of users who were newly enrolled
  #   and already enrolled.
  def add_existing_users(users)
    all_instance_users = @current_instance.instance_users.map { |iu| [iu.user_id, iu] }.to_h
    existing_instance_users = []
    new_instance_users = []
    users.each do |user|
      instance_user = all_instance_users[user[:user].id]
      if instance_user
        existing_instance_users << instance_user
      else
        new_instance_users <<
          @current_instance.instance_users.build(user: user[:user], role: user[:role])
      end
    end

    [new_instance_users, existing_instance_users]
  end

  # Generates invitations for users to the instance.
  #
  # @param [Array<Hash>] users The user descriptions to invite.
  # @return [Array(Array<Instance::UserInvitation>, Array<Instance::UserInvitation>)]
  #   A tuple containing the list of users
  #   who were newly invited and already invited.
  def invite_new_users(users)
    all_invitations = @current_instance.invitations.map { |i| [i.email.downcase, i] }.to_h
    new_invitations = []
    existing_invitations = []
    users.each do |user|
      invitation = all_invitations[user[:email]]
      if invitation
        existing_invitations << invitation
      else
        new_invitations <<
          @current_instance.invitations.build(name: user[:name],
                                              email: user[:email],
                                              role: user[:role])
      end
    end

    [validate_new_invitation_emails(new_invitations), existing_invitations]
  end

  # Validate that the new invitation emails are unique.
  #
  # The uniqueness constraint of AR does not guarantee the new_records are unique among themselves.
  # ( i.e Two new records with the same email will raise a {RecordNotUnique} error upon saving. )
  #
  # @param [Array<Instance::UserInvitation>] invitations An array of invitations.
  # @return [Array<Instance::UserInvitation>] The validated invitations.
  def validate_new_invitation_emails(invitations)
    emails = invitations.map(&:email)
    duplicates = emails.select { |email| emails.count(email) > 1 }
    return invitations if duplicates.empty?

    invitations.each do |invitation|
      invitation.errors.add(:email, :taken) if duplicates.include?(invitation.email)
    end
    invitations
  end
end
