# frozen_string_literal: true
# This concern deals with the creation of user invitations.
class Instance::UserInvitationService; end
module Instance::UserInvitationService::ProcessInvitationConcern
  extend ActiveSupport::Autoload

  private

  def process_invitations(users)
    augment_user_objects(users)
    existing_users, new_users = users.partition { |user| user[:user].present? }

    [*invite_new_users(new_users), *add_existing_users(existing_users)]
  end

  def augment_user_objects(users)
    email_user_mapping = find_existing_users(users.map { |user| user[:email] })
    users.each { |user| user[:user] = email_user_mapping[user[:email]] }
  end

  def find_existing_users(email_addresses)
    found_users = User.with_email_addresses(email_addresses)

    found_users.each.flat_map do |user|
      user.emails.map { |user_email| [user_email.email, user] }
    end.to_h
  end

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
