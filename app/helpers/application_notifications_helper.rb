# frozen_string_literal: true
module ApplicationNotificationsHelper
  # Returns the view path of the notification
  #
  # @param [#notification_view_path] notification The target notification
  # @return [String] The view path of the notification
  def notification_view_path(notification)
    activity = notification.activity
    root_path = "notifiers/#{activity.notifier_type}/#{activity.event}"
    notification_class_name = notification.class.name.underscore.tr('/', '_').pluralize
    "/#{root_path}/#{notification_class_name}/#{notification.notification_type}"
  end
end
