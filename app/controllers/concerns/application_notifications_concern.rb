module ApplicationNotificationsConcern
  extend ActiveSupport::Concern

  # Returns the view path of the notification
  #
  # @param [Course::Notification|UserNotification] notification The target notification
  # @return [String] The view path of the notification
  def notification_view_path(notification)
    activity = notification.activity
    root_path = "notifiers/#{activity.notifier_type}/#{activity.event}"
    notification_class_name = notification.class.name.underscore.gsub('/', '_').pluralize
    "/#{root_path}/#{notification_class_name}/#{notification.notification_type}"
  end
end
