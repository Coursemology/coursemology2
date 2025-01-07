# frozen_string_literal: true
class Course::Material::TextChunkReference < ApplicationRecord
  include DuplicationStateTrackingConcern

  validates :creator, presence: true
  validates :updater, presence: true
  validates :text_chunk, presence: true
  belongs_to :text_chunk, inverse_of: :text_chunk_references,
                          class_name: 'Course::Material::TextChunk'
  belongs_to :material, inverse_of: :text_chunk_references, class_name: 'Course::Material'
  after_destroy :destroy_text_chunk_if_no_references_left

  def initialize_duplicate(duplicator, other)
    self.material = duplicator.duplicate(other.material)
    self.updated_at = other.updated_at
    self.created_at = other.created_at
    self.text_chunk = other.text_chunk
    set_duplication_flag
  end

  private

  def destroy_text_chunk_if_no_references_left
    # Check if there are no other references left for the TextChunk
    return unless text_chunk.text_chunk_references.count == 0

    text_chunk.destroy # This will delete the TextChunk if no references exist
  end
end
