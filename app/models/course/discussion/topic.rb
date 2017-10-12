# frozen_string_literal: true
class Course::Discussion::Topic < ApplicationRecord
  actable
  class_attribute :global_topic_model_names
  self.global_topic_model_names = []

  belongs_to :course, inverse_of: :discussion_topics
  # Delete all the children and skip reparent callbacks
  has_many :posts, dependent: :destroy, inverse_of: :topic do
    include Course::Discussion::Topic::PostsConcern
  end
  has_many :subscriptions, dependent: :destroy, inverse_of: :topic

  accepts_nested_attributes_for :posts

  def self.global_topic_models
    global_topic_model_names.map(&:constantize)
  end

  # Topics to be displayed in the comments centre.
  scope :globally_displayed, (lambda do
    joins(:posts). # Make sure only topics with posts are returned.
      where(actable_type: global_topic_models.map(&:name))
  end)

  # Returns the topics from the user(s) specified.
  #
  # @param[Integer|Array<Integer>] user_id, the id(s) of the user(s).
  # @return[Array<Course::Discussion::Topic>]
  scope :from_user, (lambda do |user_id|
    where(
      global_topic_models.map do |model|
        "course_discussion_topics.id IN (#{model.from_user(user_id).to_sql})"
      end.join(' OR ')
    )
  end)

  scope :ordered_by_updated_at, -> { order(updated_at: :desc) }

  scope :pending_staff_reply, -> { where(pending_staff_reply: true) }

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
    ActiveRecord::Base.transaction(requires_new: true) do
      subscribed_by?(user) || subscriptions.create!(user: user)
    end
  rescue ActiveRecord::RecordInvalid, ActiveRecord::RecordNotUnique => e
    errors = e.record.errors
    return true if e.is_a?(ActiveRecord::RecordInvalid) &&
                   !errors[:topic_id].empty? && !errors[:user_id].empty?
    raise e
  end

  def mark_as_pending
    return true if pending_staff_reply

    self.pending_staff_reply = true
    save
  end

  def unmark_as_pending
    return true unless pending_staff_reply

    self.pending_staff_reply = false
    save
  end
end
