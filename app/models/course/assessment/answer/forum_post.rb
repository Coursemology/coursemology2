# frozen_string_literal: true
class Course::Assessment::Answer::ForumPost < ApplicationRecord
  validates :forum_topic_id, presence: true
  validates :post_id, presence: true
  validates :post_text, presence: true
  validates :post_creator_id, presence: true
  validates :post_updated_at, presence: true

  belongs_to :answer, class_name: Course::Assessment::Answer::ForumPostResponse.name

  attr_accessor :forum_id
  attr_accessor :forum_name
  attr_accessor :topic_title
  attr_accessor :is_topic_deleted
  attr_accessor :post_creator
  attr_accessor :is_post_updated
  attr_accessor :is_post_deleted
  attr_accessor :parent_creator
  attr_accessor :is_parent_updated
  attr_accessor :is_parent_deleted
end
