class Course::Assessment::Question::ProgrammingTestCase < ActiveRecord::Base
  belongs_to :question, class_name: Course::Assessment::Question::Programming.name,
                        inverse_of: :test_cases
end
