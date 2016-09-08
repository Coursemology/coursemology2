# frozen_string_literal: true
class Course::Assessment::Answer::ProgrammingAutoGradingTestResult < ActiveRecord::Base
  serialize :messages, Hash
  belongs_to :auto_grading, class_name: Course::Assessment::Answer::ProgrammingAutoGrading.name,
                            inverse_of: :test_results
  belongs_to :test_case, class_name: Course::Assessment::Question::ProgrammingTestCase.name,
                         inverse_of: :test_results
end
