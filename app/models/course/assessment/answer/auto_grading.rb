# frozen_string_literal: true
class Course::Assessment::Answer::AutoGrading < ActiveRecord::Base
  actable

  belongs_to :answer, class_name: Course::Assessment::Answer.name, touch: true, autosave: true,
                      inverse_of: :auto_grading
  # @!attribute [r] job
  #   This might be null if the job has been cleared.
  belongs_to :job, class_name: TrackableJob::Job.name, inverse_of: nil
end
