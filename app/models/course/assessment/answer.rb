class Course::Assessment::Answer < ActiveRecord::Base
  actable

  belongs_to :submission, inverse_of: :answers
  belongs_to :question, inverse_of: nil
end
