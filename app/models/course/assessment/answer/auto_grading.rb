# frozen_string_literal: true
class Course::Assessment::Answer::AutoGrading < ApplicationRecord
  actable

  belongs_to :answer, class_name: Course::Assessment::Answer.name, inverse_of: :auto_grading
  # @!attribute [r] job
  #   This might be null if the job has been cleared.
  belongs_to :job, class_name: TrackableJob::Job.name, inverse_of: nil
end
