# frozen_string_literal: true
class Course::Assessment::Marketplace::Preview < ApplicationRecord
  belongs_to :listing, class_name: 'Course::Assessment::Marketplace::Listing', inverse_of: :previews
  belongs_to :course_user, inverse_of: :marketplace_previews
  belongs_to :assessment, class_name: 'Course::Assessment', inverse_of: :marketplace_preview

  validates :listing, uniqueness: { scope: :course_user_id }

  def self.for(listing, course_user)
    find_by(listing: listing, course_user: course_user)
  end
end