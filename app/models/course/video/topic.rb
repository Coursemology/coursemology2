# frozen_string_literal: true
class Course::Video::Topic < ApplicationRecord
  acts_as_discussion_topic display_globally: true

  validates :timestamp, numericality: { only_integer: true, greater_than_or_equal_to: -2_147_483_648,
                                        less_than: 2_147_483_648 }, presence: true
  validates :creator, presence: true
  validates :updater, presence: true
  validates :video, presence: true

  belongs_to :video, inverse_of: :topics

  after_initialize :set_course, if: :new_record?

  # Specific implementation of Course::Discussion::Topic#from_user, this is not supposed to be
  # called directly.
  scope :from_user, (lambda do |user_id|
    # unscoped.
    #   joining { discussion_topic.posts }.
    #   where.has { discussion_topic.posts.creator_id.in(user_id) }.
    #   selecting { discussion_topic.id }
    unscoped.
      joins(:discussion_topic => :posts).
      where(Course::Discussion::Post.arel_table[:creator_id].in(user_id)).
      select(Course::Discussion::Topic.arel_table[:id])
  end)

  private

  # Set the course as the same course of the lesson plan item.
  def set_course
    self.course ||= video.lesson_plan_item.course if video
  end
end
