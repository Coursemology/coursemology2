# frozen_string_literal: true
class Course::Assessment::Marketplace::ListingVersion < ApplicationRecord
  belongs_to :listing, class_name: 'Course::Assessment::Marketplace::Listing',
                       inverse_of: :versions
  belongs_to :assessment, class_name: 'Course::Assessment', inverse_of: false
  belongs_to :published_by, class_name: 'User', inverse_of: false

  validates :version, presence: true,
                      numericality: { only_integer: true, greater_than: 0 },
                      uniqueness: { scope: :listing_id }
  validates :assessment, presence: true
  validates :published_by, presence: true
  validates :creator, presence: true
  validates :updater, presence: true

  scope :ordered, -> { order(version: :asc) }
end
