class Course::Assessment::Answer < ActiveRecord::Base
  actable

  belongs_to :submission
  belongs_to :question
end
