# frozen_string_literal: true
class Course::Assessment::Question::ProgrammingTestCase < ApplicationRecord
  enum test_case_type: { private_test: 0, public_test: 1, evaluation_test: 2 }

  validates_length_of :identifier, allow_nil: true, maximum: 255
  validates_presence_of :identifier
  validates_presence_of :test_case_type
  validates_presence_of :question
  validates_uniqueness_of :identifier, scope: [:question_id], allow_nil: true,
                                       if: -> { question_id? && identifier_changed? }
  validates_uniqueness_of :question_id, scope: [:identifier], allow_nil: true,
                                        if: -> { identifier? && question_id_changed? }

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
