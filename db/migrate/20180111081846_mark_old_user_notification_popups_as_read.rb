class MarkOldUserNotificationPopupsAsRead < ActiveRecord::Migration[5.1]
  def change
    User.find_each { |user| UserNotification.mark_as_read! :all, for: user }
    UserNotification.cleanup_read_marks!
  end
end
