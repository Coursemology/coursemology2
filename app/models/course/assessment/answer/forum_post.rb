# frozen_string_literal: true
class Course::Assessment::Answer::ForumPost < ApplicationRecord
  validates :forum_topic_id, presence: true
  validates :post_id, presence: true
  validates :post_text, presence: true
  validates :post_creator_id, presence: true
  validates :post_updated_at, presence: true

  belongs_to :answer, class_name: Course::Assessment::Answer::ForumPostResponse.name

  attr_accessor :forum_id, :forum_name, :topic_title, :is_topic_deleted, :post_creator, :is_post_updated,
                :is_post_deleted, :parent_creator, :is_parent_updated, :is_parent_deleted
end
