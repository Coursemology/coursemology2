class Course::Forum < ActiveRecord::Base
  extend FriendlyId
  friendly_id :slug_candidates, use: :scoped, scope: :course

  belongs_to :course, inverse_of: :forums
  has_many :topics, dependent: :destroy, inverse_of: :forum
  has_many :subscriptions, dependent: :destroy, inverse_of: :forum

  # @!method self.with_topic_count
  #   Augments all returned records with the number of topics in that forum.
  scope :with_topic_count, (lambda do
    joins { topics.outer }.
      select { 'course_forums.*' }.
      select { count(topics.id).as(topic_count) }.
      group { course_forums.id }
  end)

  # @!method self.with_topic_post_count
  #   Augments all returned records with the number of topic posts in that forum.
  scope :with_topic_post_count, (lambda do
    joins { topics.outer.topic.outer.posts.outer }.
      select { 'course_forums.*' }.
      select { count(topics.topic.posts.id).as(topic_post_count) }.
      group { course_forums.id }
  end)

  # @!method self.with_topic_view_count
  #   Augments all returned records with the number of topic views in that forum.
  scope :with_topic_view_count, (lambda do
    joins { topics.outer.views.outer }.
      select { 'course_forums.*' }.
      select { count(course_forum_topic_views.id).as(topic_view_count) }.
      group { course_forums.id }
  end)

  # @!method self.with_forum_statistics
  #   Augments all returned records with the number of topics, topic posts and topic views
  #   in that forum.
  scope :with_forum_statistics, (lambda do
    joins("INNER JOIN (#{with_topic_count.to_sql}) topic ON
            course_forums.id = topic.id").
      joins("INNER JOIN (#{with_topic_post_count.to_sql}) post ON
            course_forums.id = post.id").
      joins("INNER JOIN (#{with_topic_view_count.to_sql}) view ON
            course_forums.id = view.id").
      select('*')
  end)

  def self.use_relative_model_naming?
    true
  end

  # Return if a user has subscribed to this forum
  #
  # @param [User] user The user to check
  # @return [Boolean] True if the user has subscribed this forum
  def subscribed_by?(user)
    subscriptions.where(user: user).any?
  end

  # Rewrite partial path which is used to find a suitable partial to represent the object.
  def to_partial_path
    'forums/forum'
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
