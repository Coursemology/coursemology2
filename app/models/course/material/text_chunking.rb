# frozen_string_literal: true
class Course::Material::TextChunking < ApplicationRecord
  validates :material, presence: true
  validates :material_id, uniqueness: { if: :material_id_changed? }
  validates :job_id, uniqueness: { if: :job_id_changed? }, allow_nil: true
  belongs_to :material, class_name: 'Course::Material', inverse_of: :text_chunking
  # @!attribute [r] job
  #   This might be null if the job has been cleared.
  belongs_to :job, class_name: 'TrackableJob::Job', inverse_of: nil, optional: true
end
