# frozen_string_literal: true
class Course::Material::TextChunking < ApplicationRecord
  validates :material, presence: true
  validates :material_id, uniqueness: { if: :material_id_changed? }
  belongs_to :material, class_name: 'Course::Material', inverse_of: :text_chunking
  # @!attribute [r] job
  #   This might be null if the job has been cleared.
  belongs_to :job, class_name: 'TrackableJob::Job', inverse_of: nil, optional: true
end
