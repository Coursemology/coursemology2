# frozen_string_literal: true
class Course::Assessment::Answer::ProgrammingAutoGrading < ApplicationRecord
  acts_as :auto_grading, class_name: 'Course::Assessment::Answer::AutoGrading',
                         inverse_of: :actable

  before_save :strip_null_byte

  validates :exit_code, numericality: { only_integer: true }, allow_nil: true

  has_one :programming_answer, through: :answer,
                               source: :actable,
                               source_type: 'Course::Assessment::Answer::Programming'
  has_many :test_results,
           class_name: 'Course::Assessment::Answer::ProgrammingAutoGradingTestResult',
           foreign_key: :auto_grading_id, inverse_of: :auto_grading,
           dependent: :destroy
  
  belongs_to :question_snapshot,
             class_name: 'Course::Assessment::Question::Programming',
             foreign_key: :question_snapshot_id,
             optional: true

  private

  # Remove null bytes from stdout and stderr to avoid psql error:
  # ArgumentError Exception: string contains null byte
  def strip_null_byte
    self.stdout = stdout.delete("\000") if stdout
    self.stderr = stderr.delete("\000") if stderr
  end
end
