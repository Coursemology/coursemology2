# frozen_string_literal: true
class Course::Assessment::Answer::AutoGrading < ApplicationRecord
  actable optional: true

  validates_length_of :actable_type, allow_nil: true, maximum: 255
  validates_presence_of :answer
  validates_uniqueness_of :answer_id, allow_nil: true, if: :answer_id_changed?
  validates_uniqueness_of :job_id, allow_nil: true, if: :job_id_changed?
  validates_uniqueness_of :actable_type, scope: [:actable_id], allow_nil: true,
                                         if: -> { actable_id? && actable_type_changed? }
  validates_uniqueness_of :actable_id, scope: [:actable_type], allow_nil: true,
                                       if: -> { actable_type? && actable_id_changed? }

  belongs_to :answer, class_name: Course::Assessment::Answer.name, inverse_of: :auto_grading
  # @!attribute [r] job
  #   This might be null if the job has been cleared.
  belongs_to :job, class_name: TrackableJob::Job.name, inverse_of: nil, optional: true
end
