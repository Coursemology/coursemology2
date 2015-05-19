# Activity model for customisation & custom methods
class Activity < PublicActivity::Activity
  has_many :notification_styles, inverse_of: :activity, dependent: :destroy

  # overwrite public_activity gem's method to set template path for us
  def template_path(key, partial_root)
    path = key.split('.')
    path.delete_at(0) if path[0] == 'activity'
    path.unshift partial_root
    path.join('/') + 'activity_feed'
  end
end
