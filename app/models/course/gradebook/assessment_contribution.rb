# frozen_string_literal: true
class Course::Gradebook::AssessmentContribution < ApplicationRecord
  belongs_to :assessment, class_name: 'Course::Assessment',
                          inverse_of: :gradebook_assessment_contribution

  validates :creator, presence: true
  validates :updater, presence: true
  validates :weight, numericality: { greater_than_or_equal_to: 0 }, allow_nil: true
  validates :excluded, inclusion: { in: [true, false] }
  validates :assessment_id, uniqueness: true
end
