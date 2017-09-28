# frozen_string_literal: true
class Course::Forum::Topic < ActiveRecord::Base
  extend FriendlyId
  friendly_id :slug_candidates, use: :scoped, scope: :forum

  acts_as_readable on: :latest_post_at
  acts_as_discussion_topic

  after_initialize :set_defaults, if: :new_record?
  after_initialize :generate_initial_post, unless: :persisted?
  after_create :mark_as_read_for_creator
  after_update :mark_as_read_for_updater

  enum topic_type: { normal: 0, question: 1, sticky: 2, announcement: 3 }

  has_many :views, dependent: :destroy, inverse_of: :topic
  belongs_to :forum, inverse_of: :topics

  after_initialize :set_course, if: :new_record?

  # @!attribute [r] vote_count
  #   The number of votes in this topic.
  calculated :vote_count, (lambda do
    Course::Discussion::Post::Vote.joins(post: :topic).
      where('course_forum_topics.id = course_discussion_topics.actable_id').
      where('course_discussion_topics.actable_type = ?', Course::Forum::Topic.name).
      select("count('*')")
  end)

  # @!attribute [r] post_count
  #   The number of posts in this topic.
  calculated :post_count, (lambda do
    Course::Discussion::Topic.joins(:posts).
      where('actable_id = course_forum_topics.id').
      where(actable_type: Course::Forum::Topic.name).
      select("count('*')")
  end)

  # @!attribute [r] view_count
  #   The number of views in this topic.
  calculated :view_count, (lambda do
    Course::Forum::Topic::View.where('topic_id = course_forum_topics.id').select("count('*')")
  end)

  # @!method self.order_by_latest_post
  #   Orders the topics by their latest post
  scope :order_by_latest_post, (lambda do
    order(latest_post_at: :desc)
  end)

  # @!method self.with_latest_post
  #   Augments all returned records with the latest post.
  scope :with_latest_post, (lambda do
    topic_ids = distinct(false).pluck('course_discussion_topics.id')
    ids = Course::Discussion::Post.unscope(:order).
          select('max(id)').
          group('course_discussion_posts.topic_id').
          where(topic_id: topic_ids)
    last_posts = Course::Discussion::Post.with_creator.where(id: ids)

    all.tap do |result|
      preloader = ActiveRecord::Associations::Preloader::ManualPreloader.new
      preloader.preload(result, { discussion_topic: :posts }, last_posts)
    end
  end)

  # @!method self.with_topic_statistics
  #   Augments all returned records with the number of posts and views in that topic.
  scope :with_topic_statistics,
        -> { all.calculated(:post_count, :view_count) }

  # Get all the topics from specified course.
  scope :from_course, ->(course) { joins(:forum).where('course_forums.course_id = ?', course.id) }

  # Filter out the resolved forums from the given ids and keep the unresolved forum ids.
  def self.filter_unresolved_forum(forum_ids)
    # Unscope the default scope of eager loading discussion topics to improve performance.
    unscoped.question.where(resolved: false, forum_id: forum_ids).pluck(:forum_id).to_set
  end

  # Create view record for a user
  #
  # @param [User] user The user who views a topic
  def viewed_by(user)
    views.create(user: user)
  end

  # Update the `resolve` boolean status based on correct answer counts.
  def update_resolve_status
    status = posts.where(answer: true).count > 0
    if resolved != status
      update_attribute(:resolved, status)
    else
      true
    end
  end

  private

  # Try building a slug based on the following fields in
  # increasing order of specificity.
  def slug_candidates
    [
      :title,
      [:title, :forum_id]
    ]
  end

  # Generate new friendly_id after updating
  def should_generate_new_friendly_id?
    title_changed?
  end

  def generate_initial_post
    posts.build if posts.empty?
  end

  def mark_as_read_for_creator
    mark_as_read! for: creator
  end

  def mark_as_read_for_updater
    mark_as_read! for: updater
  end

  # Set the course as the same course of the forum.
  def set_course
    self.course ||= forum.course if forum
  end

  def set_defaults
    self.latest_post_at ||= Time.zone.now
  end
end
