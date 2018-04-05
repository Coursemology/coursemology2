# frozen_string_literal: true
class Course::Discussion::Post < ApplicationRecord
  extend Course::Discussion::Post::OrderingConcern
  include Course::ForumParticipationConcern

  acts_as_forest order: :created_at, optional: true
  acts_as_readable on: :updated_at
  has_many_attachments

  after_initialize :set_topic, if: :new_record?
  after_commit :mark_topic_as_read
  before_destroy :reparent_children, unless: :destroyed_by_association
  before_destroy :unparent_children, if: :destroyed_by_association

  validate :parent_topic_consistency
  validates :text, presence: true

  belongs_to :topic, inverse_of: :posts, touch: true
  has_many :votes, inverse_of: :post, dependent: :destroy

  default_scope { ordered_by_created_at.with_creator }
  scope :ordered_by_created_at, -> { order(created_at: :asc) }
  scope :with_creator, -> { includes(:creator) }

  # @!method self.with_user_votes(user)
  #   Preloads the given posts with votes from the given user.
  #
  #   @param [User] user The user to load votes for.
  scope :with_user_votes, (lambda do |user|
    post_ids = pluck('course_discussion_posts.id')
    votes = Course::Discussion::Post::Vote.
      where('course_discussion_post_votes.post_id IN (?)', post_ids).
      where('course_discussion_post_votes.creator_id = ?', user.id)

    all.tap do |result|
      preloader = ActiveRecord::Associations::Preloader::ManualPreloader.new
      preloader.preload(result, :votes, votes)
    end
  end)

  # @!attribute [r] upvotes
  #   The number of upvotes for the given post.
  calculated :upvotes, (lambda do
    Vote.upvotes.
      select('count(id)').
      where('post_id = course_discussion_posts.id')
  end)

  # @!attribute [r] downvotes
  #   The number of downvotes for the given post.
  calculated :downvotes, (lambda do
    Vote.downvotes.
      select('count(id)').
      where('post_id = course_discussion_posts.id')
  end)

  # Calculates the total number of votes given to this post.
  #
  # @return [Integer]
  def vote_tally
    upvotes - downvotes
  end

  # Gets the vote cast by the given user for the current post.
  #
  # @param [User] user The user to retrieve the vote for.
  # @return [Course::Discussion::Post::Vote] The vote that the user cast.
  # @return [nil] The user has not cast a vote.
  def vote_for(user)
    votes.loaded? ? votes.find { |vote| vote.creator == user } : votes.find_by(creator: user)
  end

  # Allows a user to cast a vote for this post.
  #
  # @param [User] user The user casting the vote.
  # @param [Integer] vote {-1, 0, 1} indicating whether this is a downvote, no vote, or upvote.
  def cast_vote!(user, vote)
    vote = vote <=> 0
    vote_record = votes.find_by(creator: user)

    if vote == 0
      vote_record&.destroy!
    else
      vote_record ||= votes.build(creator: user)
      vote_record.vote_flag = vote > 0
      vote_record.save!
    end
  end

  # Mark/unmark post as the correct answer.
  def toggle_answer
    self.class.transaction do
      raise ActiveRecord::Rollback unless update_column(:answer, !answer)
      raise ActiveRecord::Rollback unless topic.specific.update_resolve_status
    end

    true
  end

  # Use the CourseUser name if available, else fallback to the User name.
  #
  # @return [String] The CourseUser/User name of the post author.
  def author_name
    course_user = topic.course.course_users.for_user(creator).first
    course_user&.name || creator.name
  end

  private

  def set_topic
    self.topic ||= parent.topic if parent
  end

  def parent_topic_consistency
    errors.add(:topic_inconsistent) if parent && topic != parent.topic
  end

  def reparent_children
    children.update_all(parent_id: parent_id)
  end

  # Should be called only when destroyed by association.
  #
  # We unset the children's parent id so they don't trigger a foreign key exception when the
  # parent is marked for destruction first. They will be destroyed by association later.
  #
  # This method assumes that :destroyed_by_association is true if and only if the entire topic
  # the post belongs to is being destroyed.
  def unparent_children
    children.update_all(parent_id: nil)
  end

  def mark_topic_as_read
    topic.mark_as_read! for: creator
  end
end
