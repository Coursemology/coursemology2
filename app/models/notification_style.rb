class NotificationStyle < ActiveRecord::Base
  belongs_to :activity, inverse_of: :notification_styles, dependent: :destroy

  acts_as_readable on: :updated_at

  # Translate the key of activity which this notification is based on to path
  #   The path will be /ClassName/notifications/activity_type/notification_type
  #
  # @return [String]
  def template_path
    partial_root = ''
    path = activity.key.split('.')
    path.unshift partial_root
    path.join('/') + "/#{notification_type}"
  end
end
