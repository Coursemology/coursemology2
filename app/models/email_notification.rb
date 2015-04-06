class EmailNotification < Notification
  def self.create_notification(user, course, options = {})
    NotificationMailer.notification(user, course, options)
  end
end
