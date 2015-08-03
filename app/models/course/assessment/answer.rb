class Course::Assessment::Answer < ActiveRecord::Base
  include Workflow
  actable

  workflow do
    state :attempting do
      event :submit, transitions_to: :submitted
    end
    state :submitted do
      event :unsubmit, transitions_to: :attempting
      event :grade, transitions_to: :graded
    end
    state :graded
  end

  belongs_to :submission, inverse_of: :answers
  belongs_to :question, inverse_of: nil
end
