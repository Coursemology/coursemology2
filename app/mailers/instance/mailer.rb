# frozen_string_literal: true
class Instance::Mailer < ApplicationMailer
  # Sends an invitation email for the given invitation.
  #
  # @param [Instance] instance The instance that was involved.
  # @param [Instance::UserInvitation] invitation The invitation which was generated.
  def user_invitation_email(invitation)
    ActsAsTenant.without_tenant do
      @instance = invitation.instance
    end
    @invitation = invitation
    @recipient = invitation

    I18n.with_locale(:en) do
      mail(to: invitation.email, subject: t('.subject', instance: @instance.name, role: invitation.role))
    end
  end

  def user_added_email(user)
    ActsAsTenant.without_tenant do
      @instance = user.instance
    end
    @recipient = user.user

    I18n.with_locale(@recipient.locale) do
      mail(to: @recipient.email, subject: t('.subject', instance: @instance.name))
    end
  end
end
