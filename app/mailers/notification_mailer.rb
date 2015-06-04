class NotificationMailer < ApplicationMailer
  layout 'notifications/email'

  # Send email using input template and objects
  #
  # @param recipient [User] who does this email send for
  # @param sender [Object] who sends out this email
  # @param object [Object] what does this email about
  # @param template_url [String] the path of email's template
  def notify(recipient, sender, object, template_url)
    @recipient = recipient
    @sender = sender
    @object = object
    mail(to: recipient.email) do |format|
      format.html { render template_url }
    end
  end
end
