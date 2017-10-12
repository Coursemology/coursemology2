# frozen_string_literal: true
class Course::Assessment::Question::ProgrammingTestCase < ApplicationRecord
  enum test_case_type: { private_test: 0, public_test: 1, evaluation_test: 2 }

  belongs_to :question, class_name: Course::Assessment::Question::Programming.name,
                        inverse_of: :test_cases
  has_many :test_results,
           class_name: Course::Assessment::Answer::ProgrammingAutoGradingTestResult.name,
           inverse_of: :test_case,
           dependent: :destroy,
           foreign_key: :test_case_id

  # Don't need to duplicate the test results
  def initialize_duplicate(_duplicator, _other)
  end
end
