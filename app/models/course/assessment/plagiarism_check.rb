# frozen_string_literal: true
class Course::Assessment::PlagiarismCheck < ApplicationRecord
  include Workflow

  workflow do
    state :not_started do
      event :run, transitions_to: :running
    end
    state :running do
      event :complete, transitions_to: :completed
      event :fail, transitions_to: :failed
    end
    state :completed do
      event :run, transitions_to: :running
    end
    state :failed do
      event :run, transitions_to: :running
    end
  end

  validates :assessment, presence: true
  validates :assessment_id, uniqueness: { if: :assessment_id_changed? }
  validates :job_id, uniqueness: { if: :job_id_changed? }, allow_nil: true
  validates :workflow_state, length: { maximum: 255 }, presence: true

  belongs_to :assessment, class_name: 'Course::Assessment', inverse_of: :plagiarism_check
  # @!attribute [r] job
  #   This might be null if the job has been cleared.
  belongs_to :job, class_name: 'TrackableJob::Job', inverse_of: nil, optional: true
end
