class Course::Forum::Topic < ActiveRecord::Base
  extend FriendlyId
  friendly_id :slug_candidates, use: :scoped, scope: :forum

  acts_as :topic, class_name: Course::Discussion::Topic.name, inverse_of: :actable

  before_validation :set_initial_post_title

  enum topic_type: { normal: 0, question: 1, sticky: 2, announcement: 3 }

  has_many :views, dependent: :destroy, inverse_of: :topic
  belongs_to :forum, inverse_of: :topics

  # @!attribute [r] post_count
  #   The number of posts in this topic.
  calculated :post_count, (lambda do
    from('course_discussion_topics topic INNER JOIN course_discussion_posts
      post ON topic.id = post.topic_id').select { count('*') }.
      where('topic.actable_id = course_forum_topics.id AND topic.actable_type = ?', name)
  end)

  # @!attribute [r] view_count
  #   The number of views in this topic.
  calculated :view_count, (lambda do
    Course::Forum::Topic::View.where do
      course_forum_topic_views.topic_id == course_forum_topics.id
    end.select { count('*') }
  end)

  # @!method self.with_latest_post
  #   Augments all returned records with the latest post.
  scope :with_latest_post, (lambda do
    ids = Course::Discussion::Post.select { max(id) }.group { 'course_discussion_posts.topic_id' }
    last_posts = Course::Discussion::Post.where(id: ids).includes(:creator)

    all.tap do |result|
      preloader = ActiveRecord::Associations::Preloader::ManualPreloader.new
      preloader.preload(result, { topic: :posts }, last_posts)
    end
  end)

  def votes_count
    0 # :TODO
  end

  # Return if a user has subscribed to this topic
  #
  # @param [User] user The user to check
  # @return [Boolean] True if the user has subscribed this topic
  def subscribed_by?(user)
    subscriptions.where(user: user).any?
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

  def set_initial_post_title
    posts.first.title = title unless posts.empty?
  end
end
