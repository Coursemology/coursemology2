# frozen_string_literal: true
class Course::Forum < ApplicationRecord
  extend FriendlyId
  friendly_id :slug_candidates, use: :scoped, scope: :course

  belongs_to :course, inverse_of: :forums
  has_many :topics, dependent: :destroy, inverse_of: :forum
  has_many :subscriptions, dependent: :destroy, inverse_of: :forum

  # @!attribute [r] topic_count
  #   The number of topics in this forum.
  calculated :topic_count, (lambda do
    Course::Forum::Topic.where('course_forum_topics.forum_id = course_forums.id').
      select("count('*')")
  end)

  # @!attribute [r] topic_post_count
  #   The number of posts in this forum.
  calculated :topic_post_count, (lambda do
    Course::Forum::Topic.
      joining { discussion_topic.outer.posts.outer }.
      where('course_forum_topics.forum_id = course_forums.id').
      select("count('*')")
  end)

  # @!attribute [r] topic_view_count
  #   The number of views in this forum.
  calculated :topic_view_count, (lambda do
    Course::Forum::Topic.joins(:views).
      where('course_forum_topics.forum_id = course_forums.id').
      select("count('*')")
  end)

  calculated :topic_unread_count, (lambda do |user|
    Course::Forum::Topic.where('course_forum_topics.forum_id = course_forums.id').
      unread_by(user).
      select("count('*')")
  end)

  # @!method self.with_forum_statistics
  #   Augments all returned records with the number of topics, topic posts and topic views
  #   in that forum.
  scope :with_forum_statistics,
        (lambda do |user|
          all.calculated(
            :topic_count,
            :topic_view_count,
            :topic_post_count,
            topic_unread_count: user
          )
        end)

  def self.use_relative_model_naming?
    true
  end

  # Return if a user has subscribed to this forum
  #
  # @param [User] user The user to check
  # @return [Boolean] True if the user has subscribed this forum
  def subscribed_by?(user)
    !subscriptions.where(user: user).empty?
  end

  # Rewrite partial path which is used to find a suitable partial to represent the object.
  def to_partial_path
    'forums/forum'
  end

  def initialize_duplicate(duplicator, _other)
    self.course = duplicator.options[:target_course]
  end

  private

  # Try building a slug based on the following fields in
  # increasing order of specificity.
  def slug_candidates
    [
      :name,
      [:name, :course_id]
    ]
  end

  # Generate new friendly_id after updating
  def should_generate_new_friendly_id?
    name_changed?
  end
end
