# frozen_string_literal: true
class Course::Assessment::Answer::ProgrammingAutoGrading < ApplicationRecord
  acts_as :auto_grading, class_name: Course::Assessment::Answer::AutoGrading.name,
                         inverse_of: :actable

  validates_numericality_of :exit_code, allow_nil: true, only_integer: true, greater_than_or_equal_to: -2147483648, less_than: 2147483648

  has_one :programming_answer, through: :answer,
                               source: :actable,
                               source_type: Course::Assessment::Answer::Programming.name
  has_many :test_results,
           class_name: Course::Assessment::Answer::ProgrammingAutoGradingTestResult.name,
           foreign_key: :auto_grading_id, inverse_of: :auto_grading,
           dependent: :destroy
end
