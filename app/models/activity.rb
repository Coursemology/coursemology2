# Activity model for customisation & custom methods
class Activity < PublicActivity::Activity
  has_many :notification_styles, inverse_of: :activity, dependent: :destroy

  # Translate the key of activity to path
  #   The path will be /ClassName/notifications/activity_type/activity_feed
  #
  # @return [String]
  def template_path
    partial_root = ''
    path = key.split('.')
    path.unshift partial_root
    path.join('/') + '/activity_feed'
  end
end
