# frozen_string_literal: true
class Course::Assessment::Marketplace::Listing < ApplicationRecord
  belongs_to :assessment, class_name: 'Course::Assessment', inverse_of: :marketplace_listing
  belongs_to :publisher, class_name: 'User', inverse_of: false
  belongs_to :current_version, class_name: 'Course::Assessment::Marketplace::ListingVersion',
                               inverse_of: false, optional: true
  belongs_to :source_course, class_name: 'Course', inverse_of: false, optional: true
  belongs_to :fallback_maintainer, class_name: 'User', inverse_of: false, optional: true
  has_many :adoptions, class_name: 'Course::Assessment::Marketplace::Adoption',
                       inverse_of: :listing, dependent: :destroy
  has_many :versions, class_name: 'Course::Assessment::Marketplace::ListingVersion',
                      inverse_of: :listing, dependent: :destroy

  validates :assessment_id, uniqueness: true
  validates :publisher, presence: true
  validates :creator, presence: true
  validates :updater, presence: true

  scope :published, -> { where(published: true) }

  def adoption_count
    adoptions.distinct.count(:destination_course_id)
  end
end
