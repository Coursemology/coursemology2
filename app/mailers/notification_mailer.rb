class NotificationMailer < ApplicationMailer
  layout 'notifications/email'

  # Send email using input template
  #
  # @param [User] recipient who does this email send for
  # @param [Object] sender who sends out this email
  # @param [Object] object what does this email about
  # @param [String] template_url the path of email's template
  def notify(recipient, sender, object, template_url)
    @recipient = recipient
    @sender = sender
    @object = object
    mail(to: recipient.email) do |format|
      format.html { render template_url }
    end
  end
end
