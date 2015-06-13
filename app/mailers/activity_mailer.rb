# The mailer for activities. This is meant to be called by the activities framework alone.
#
# @api private
class ActivityMailer < ApplicationMailer
  # Emails a recipient, informing him of an activity.
  #
  # @param [User] recipient The recipient of the email.
  # @param object The object to be made available to the view, accessible using +@object+.
  # @param [String] view_path The path to the view which should be rendered.
  def email(recipient, object, view_path)
    @recipient = recipient
    @object = object
    mail(to: recipient.email) do |format|
      format.html { render view_path }
      format.text { render view_path }
    end
  end
end
