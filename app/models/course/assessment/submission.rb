class Course::Assessment::Submission < ActiveRecord::Base
  include Workflow
  acts_as_experience_points_record

  workflow do
    state :attempting do
      event :finalize, transitions_to: :submitted
    end
    state :submitted do
      event :unsubmit, transitions_to: :attempting
      event :grade, transitions_to: :graded
    end
    state :graded
  end

  belongs_to :assessment, inverse_of: :submissions

  # @!attribute [r] answers
  #   The answers associated with this submission. There can be more than one answer per submission,
  #   this is because every answer is saved over time. Use the {.latest} scope of the answers if
  #   only the latest answer for each question is desired.
  has_many :answers, inverse_of: :submission
  has_many :multiple_response_answers,
           through: :answers, source: :actable,
           source_type: Course::Assessment::Answer::MultipleResponse.name
end
