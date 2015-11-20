class Course::Assessment::Question::ProgrammingTestCase < ActiveRecord::Base
  schema_validations except: :description

  validates :description, exclusion: [nil]

  belongs_to :question, class_name: Course::Assessment::Question::Programming.name,
                        inverse_of: :test_cases
end
