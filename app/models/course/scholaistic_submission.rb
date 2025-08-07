# frozen_string_literal: true
class Course::ScholaisticSubmission < ApplicationRecord
  acts_as_experience_points_record

  validates :upstream_id, presence: true
  validates :assessment, presence: true
  validates :creator, presence: true

  belongs_to :assessment, inverse_of: :submissions, class_name: Course::ScholaisticAssessment.name
end
