class Course::Assessment::Answer::ProgrammingFile < ActiveRecord::Base
  belongs_to :answer, class_name: Course::Assessment::Answer::Programming.name, inverse_of: :files
end
