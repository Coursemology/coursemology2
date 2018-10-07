# frozen_string_literal: true
class Course::Assessment::Answer::ProgrammingAutoGradingTestResult < ApplicationRecord
  self.table_name = 'course_assessment_answer_programming_test_results'

  validates_inclusion_of :passed, in: [true, false], message: :blank
  validates_presence_of :auto_grading

  belongs_to :auto_grading, class_name: Course::Assessment::Answer::ProgrammingAutoGrading.name,
                            inverse_of: :test_results
  belongs_to :test_case, class_name: Course::Assessment::Question::ProgrammingTestCase.name,
                         inverse_of: :test_results, optional: true
end
