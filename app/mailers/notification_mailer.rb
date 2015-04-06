class NotificationMailer < ApplicationMailer
  # Subject can be set in your I18n file at config/locales/en.yml
  # with the following lookup:
  #
  #   en.notification_mailer.notification.subject
  #
  layout :false

  def notification(user, options = {})
    @user = user
    @options = options
    mail(to: user.email, subject: "#{options[:title]}")
  end
end
