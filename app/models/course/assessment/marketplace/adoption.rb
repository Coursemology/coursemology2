# frozen_string_literal: true
class Course::Assessment::Marketplace::Adoption < ApplicationRecord
  belongs_to :listing, class_name: 'Course::Assessment::Marketplace::Listing', inverse_of: :adoptions
  belongs_to :destination_course, class_name: 'Course', inverse_of: false
  belongs_to :duplicated_assessment, class_name: 'Course::Assessment', inverse_of: false

  validates :duplicated_assessment_id, uniqueness: true
  validates :creator, presence: true
  validates :updater, presence: true
end
