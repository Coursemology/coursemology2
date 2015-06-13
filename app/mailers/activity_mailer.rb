class ActivityMailer < ApplicationMailer
  layout 'email'

  # Send an email to a recipient using input template path and object tracked by an activity
  # to inform the content of the activity
  #
  # @param [User] recipient the user who will receive this email
  # @param object the tracked object in an activity and it will be used in the given template
  # @param [String] template_path the path of the template
  def email(recipient, object, template_path)
    @recipient = recipient
    @object = object
    mail(to: recipient.email) do |format|
      format.html { render template_path }
      format.text { render template_path }
    end
  end
end
