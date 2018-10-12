# frozen_string_literal: true

# This concern deals with the sending of user invitation emails.
class Instance::UserInvitationService; end
module Instance::UserInvitationService::EmailInvitationConcern
  extend ActiveSupport::Autoload

  private

  def send_registered_emails(registered_users)
    registered_users.each do |user|
      Instance::Mailer.user_added_email(user).deliver_later
    end

    true
  end

  def send_invitation_emails(invitations)
    invitations.each do |invitation|
      Instance::Mailer.user_invitation_email(invitation).deliver_later
    end
    ids = invitations.select(&:id)
    Instance::UserInvitation.where(id: ids).update_all(sent_at: Time.zone.now)
    true
  end
end
