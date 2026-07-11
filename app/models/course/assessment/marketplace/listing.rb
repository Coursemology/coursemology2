# frozen_string_literal: true
class Course::Assessment::Marketplace::Listing < ApplicationRecord
  belongs_to :assessment, class_name: 'Course::Assessment', inverse_of: :marketplace_listing
  belongs_to :publisher, class_name: 'User', inverse_of: false
  has_many :adoptions, class_name: 'Course::Assessment::Marketplace::Adoption',
                       inverse_of: :listing, dependent: :destroy
  has_many :previews, class_name: 'Course::Assessment::Marketplace::Preview',
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
