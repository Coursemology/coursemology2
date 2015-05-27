class NotificationMailer < ApplicationMailer
  layout 'notifications/email'

  def notify(recipient, owner, trackable, template_url)
    @recipient = recipient
    @owner = owner
    @trackable = trackable
    mail(to: recipient.email) do |format|
      format.html { render template_url }
    end
  end
end
