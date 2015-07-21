class Course::Assessment::Submission < ActiveRecord::Base
  include Workflow
  acts_as_experience_points_record

  workflow do
    state :created do
      event :finalize, transitions_to: :submitted
    end
    state :submitted do
      event :unsubmit, transitions_to: :created
      event :submit, transitions_to: :graded
    end
    state :graded
  end

  belongs_to :assessment
  has_many :answers
end
