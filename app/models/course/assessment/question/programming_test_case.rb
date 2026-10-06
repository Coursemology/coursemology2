# frozen_string_literal: true
class Course::Assessment::Question::ProgrammingTestCase < ApplicationRecord
  include Course::Assessment::Question::ProgrammingSnapshotReadOnlyConcern

  enum :test_case_type, { private_test: 0, public_test: 1, evaluation_test: 2 }

  validates :identifier, length: { maximum: 255 }, presence: true
  validates :test_case_type, presence: true
  validates :question, presence: true
  validates :identifier, uniqueness: { scope: [:question_id],
                                       if: -> { question_id? && identifier_changed? } }
  validates :question_id, uniqueness: { scope: [:identifier],
                                        if: -> { identifier? && question_id_changed? } }

  belongs_to :question, class_name: 'Course::Assessment::Question::Programming',
                        inverse_of: :test_cases
  has_many :test_results,
           class_name: 'Course::Assessment::Answer::ProgrammingAutoGradingTestResult',
           inverse_of: :test_case,
           dependent: :destroy,
           foreign_key: :test_case_id

  # Don't need to duplicate the test results
  def initialize_duplicate(_duplicator, _other)
  end

  private

  # Whether this belongs to a snapshot, or did until this change. See
  # Course::Assessment::Question::ProgrammingSnapshotReadOnlyConcern.
  def part_of_snapshot?
    return true if question&.snapshot?
    return false unless question_id_changed? && question_id_in_database

    # Not exists?: acts_as joins the parent question row to it, which a snapshot does not have.
    Course::Assessment::Question::Programming.where(id: question_id_in_database).pick(:current_id).present?
  end
end
