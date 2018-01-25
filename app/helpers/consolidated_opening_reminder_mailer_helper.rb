# frozen_string_literal: true
module ConsolidatedOpeningReminderMailerHelper
  include ApplicationNotificationsHelper

  # Returns the view path of the actable type
  #
  # @param [Course::Notification] notification The notification object
  # @param [String] actable_type The lesson plan actable type as a String
  # @return [String] The view path of the actable type
  def actable_type_partial_path(notification, actable_type)
    "#{notification_directory_path(notification)}/#{actable_type.underscore}"
  end
end
