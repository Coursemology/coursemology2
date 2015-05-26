# Activity model for customisation & custom methods
class Activity < PublicActivity::Activity
  has_many :notification_styles, inverse_of: :activity, dependent: :destroy

  def template_path
    partial_root = ''
    path = key.split('.')
    path.unshift partial_root
    path.join('/') + '/activity_feed'
  end
end
