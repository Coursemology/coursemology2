# Activity model for customisation & custom methods
class Activity < PublicActivity::Activity
  belongs_to :notification, inverse_of: :activity, dependent: :destroy

  # Translate the key of activity to path with a given type of notification
  #
  # @example template_path(:popup) => /ClassName/notifications/ActivityType/popup
  #
  # @param [Symbol] notification_type the type of notification
  # @return [String]
  def template_path(notification_type)
    return unless [:activity_feed, :email, :popup].include?(notification_type)
    path = key.split('.')
    format("/%s/#{notification_type}", path.join('/'))
  end
end
