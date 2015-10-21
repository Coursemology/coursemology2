class Course::Assessment::Answer::TextResponse < ActiveRecord::Base
  acts_as :answer, class_name: Course::Assessment::Answer.name, inverse_of: :actable
end
