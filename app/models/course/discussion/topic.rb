# frozen_string_literal: true
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

  # Create subscription for a user
  #
  # The additional transaction is in place because a RecordNotUnique will cause the active
  # transaction to be considered as errored, and needing a rollback.
  #
  # @param [User] user The user who needs to subscribe to this topic
  def ensure_subscribed_by(user)
    return true if self.subscribed_by?(user)
    ActiveRecord::Base.transaction(requires_new: true) do
      subscriptions.build(user: user).save!
    end
  rescue ActiveRecord::RecordInvalid, ActiveRecord::RecordNotUnique => e
    return true if e.is_a?(ActiveRecord::RecordInvalid) &&
                   e.record.errors[:topic_id].any? && e.record.errors[:user_id].any?
    raise e
  end
end
