# Activity model for customisation & custom methods
class Activity < PublicActivity::Activity
  belongs_to :notification, inverse_of: :activity, dependent: :destroy
end
