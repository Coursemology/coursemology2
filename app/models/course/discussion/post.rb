# frozen_string_literal: true
class Course::Discussion::Post < ActiveRecord::Base
  include Course::Discussion::Post::OrderingConcern

  acts_as_forest order: :created_at
  has_many_attachments

  after_initialize :set_topic, if: :new_record?
  after_initialize :set_title, if: :new_record?
  before_validation :set_title

  validate :parent_topic_consistency

  belongs_to :topic, inverse_of: :posts
  has_many :votes, inverse_of: :post, dependent: :destroy

  default_scope { ordered_by_created_at.with_creator }
  scope :ordered_by_created_at, -> { order(created_at: :asc) }
  scope :with_creator, -> { includes(:creator) }

  private

  def set_topic
    self.topic ||= parent.topic if parent
  end

  def set_title
    return unless parent

    self.title ||= self.class.human_attribute_name('title_reply_template', title: parent.title)
  end

  def parent_topic_consistency
    errors.add(:topic_inconsistent) if parent && topic != parent.topic
  end
end
