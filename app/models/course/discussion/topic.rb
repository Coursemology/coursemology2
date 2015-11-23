class Course::Discussion::Topic < ActiveRecord::Base
  actable

  has_many :posts, dependent: :destroy, inverse_of: :topic
  has_many :subscriptions, dependent: :destroy, inverse_of: :topic

  accepts_nested_attributes_for :posts

  # Return if a user has subscribed to this topic
  #
  # @param [User] user The user to check
  # @return [Boolean] True if the user has subscribed this topic
  def subscribed_by?(user)
    subscriptions.where(user: user).any?
  end
end
