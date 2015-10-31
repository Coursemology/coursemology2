class Course::Assessment::Answer::AutoGrading < ActiveRecord::Base
  enum status: [:submitted, :graded, :errored]

  belongs_to :answer, class_name: Course::Assessment::Answer.name, touch: true, autosave: true,
                      inverse_of: :auto_grading
end
