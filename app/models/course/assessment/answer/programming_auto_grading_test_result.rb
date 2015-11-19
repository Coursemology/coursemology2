class Course::Assessment::Answer::ProgrammingAutoGradingTestResult < ActiveRecord::Base
  belongs_to :auto_grading, class_name: Course::Assessment::Answer::ProgrammingAutoGrading.name,
                            inverse_of: :test_results
end
