# frozen_string_literal: true
class Course::Assessment::Answer::ProgrammingAutoGrading < ApplicationRecord
  acts_as :auto_grading, class_name: Course::Assessment::Answer::AutoGrading.name,
                         inverse_of: :actable
  has_one :answer, through: :auto_grading
  has_one :programming_answer, through: :answer,
                               source: :actable,
                               source_type: Course::Assessment::Answer::Programming.name
  has_many :test_results,
           class_name: Course::Assessment::Answer::ProgrammingAutoGradingTestResult.name,
           foreign_key: :auto_grading_id, inverse_of: :auto_grading,
           dependent: :destroy
end
