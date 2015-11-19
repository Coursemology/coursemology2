class Course::Assessment::Answer::Programming < ActiveRecord::Base
  # The table name for this model is singular.
  self.table_name = table_name.singularize

  acts_as :answer, class_name: Course::Assessment::Answer.name, inverse_of: :actable

  has_many :files, class_name: Course::Assessment::Answer::ProgrammingFile.name,
                   inverse_of: :answer
end
