class Course::Assessment::Answer::ProgrammingFile < ActiveRecord::Base
  schema_validations except: [:content]

  validates :content, exclusion: [nil]

  belongs_to :answer, class_name: Course::Assessment::Answer::Programming.name, inverse_of: :files
end
