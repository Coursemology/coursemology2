class Notification::EmailNotification < Notification
  def self.notify(user, course, options = {})
    NotificationMailer.notification(user, course, options).deliver
  end
end
