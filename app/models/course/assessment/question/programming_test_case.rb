# frozen_string_literal: true
class Course::Assessment::Question::ProgrammingTestCase < ActiveRecord::Base
  schema_validations except: :description

  validates :description, exclusion: [nil]

  belongs_to :question, class_name: Course::Assessment::Question::Programming.name,
                        inverse_of: :test_cases
  has_many :test_results,
           class_name: Course::Assessment::Answer::ProgrammingAutoGradingTestResult.name,
           inverse_of: :test_case,
           dependent: :destroy,
           foreign_key: :test_case_id
end
