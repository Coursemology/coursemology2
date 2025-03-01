# frozen_string_literal: true
class Course::Forum::DiscussionReference < ApplicationRecord
  include DuplicationStateTrackingConcern

  validates :creator, presence: true
  validates :updater, presence: true
  validates :discussion, presence: true
  belongs_to :discussion, inverse_of: :discussion_references,
                          class_name: 'Course::Forum::Discussion'
  belongs_to :forum_import, inverse_of: :discussion_references, class_name: 'Course::Forum::Import'
  after_destroy :destroy_discussion_if_no_references_left

  def destroy_discussion_if_no_references_left
    # Check if there are no other references left for the TextChunk
    return unless discussion.discussion_references.count == 0

    discussion.destroy # This will delete the TextChunk if no references exist
  end

  def initialize_duplicate(duplicator, other)
    self.forum_import = duplicator.duplicate(other.forum_import)
    set_duplication_flag
  end
end
