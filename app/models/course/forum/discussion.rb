# frozen_string_literal: true
class Course::Forum::Discussion < ApplicationRecord
  has_neighbors :embedding
  validates :discussion, presence: true
  validates :embedding, presence: true
  validates :name, presence: true
  has_many :discussion_references, class_name: 'Course::Forum::DiscussionReference',
                                   dependent: :destroy
  has_many :forum_imports, through: :discussion_references, class_name: 'Course::Forum::Import'

  class << self
    def existing_discussion(discussion)
      where(name: Digest::SHA256.hexdigest(discussion.to_json))
    end
  end
end
