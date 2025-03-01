# frozen_string_literal: true
class Course::Forum::RagAutoAnswering < ApplicationRecord
  validates :post, presence: true
  validates :post_id, uniqueness: { if: :post_id_changed? }
  validates :job_id, uniqueness: { if: :job_id_changed? }, allow_nil: true
  belongs_to :post, class_name: 'Course::Discussion::Post', inverse_of: :rag_auto_answering
  # @!attribute [r] job
  #   This might be null if the job has been cleared.
  belongs_to :job, class_name: 'TrackableJob::Job', inverse_of: nil, optional: true
end
