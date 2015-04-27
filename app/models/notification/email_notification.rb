class Notification::EmailNotification < Notification
  def self.notify(user, _course, options = {})
    NotificationMailer.notification_email(user, options).deliver_now
  end
end
