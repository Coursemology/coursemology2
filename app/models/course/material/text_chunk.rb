# frozen_string_literal: true
class Course::Material::TextChunk < ApplicationRecord
  has_neighbors :embedding
  validates :content, presence: true
  validates :embedding, presence: true
  validates :name, presence: true
  has_many :text_chunk_references, class_name: 'Course::Material::TextChunkReference',
                                   dependent: :destroy

  class << self
    def existing_chunks(attributes)
      file = attributes.delete(:file)
      attributes[:name] = file_digest(file)
      where(attributes)
    end

    private

    def file_digest(file)
      # Get the actual file by #tempfile if the file is an `ActionDispatch::Http::UploadedFile`.
      Digest::SHA256.file(file.try(:tempfile) || file).hexdigest
    end
  end
end
