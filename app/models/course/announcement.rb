# frozen_string_literal: true
class Course::Announcement < ApplicationRecord
  include AnnouncementConcern
  include Course::OpeningReminderConcern

  acts_as_readable on: :updated_at
  has_many_attachments on: :content

  validates :title, length: { maximum: 255 }, presence: true
  validates :sticky, inclusion: { in: [true, false] }
  validates :start_at, presence: true
  validates :end_at, presence: true
  validates :opening_reminder_token, numericality: true, allow_nil: true
  validates :creator, presence: true
  validates :updater, presence: true
  validates :course, presence: true

  belongs_to :course, inverse_of: :announcements

  scope :sorted_by_date, -> { order(start_at: :desc) }
  scope :sorted_by_sticky, -> { order(sticky: :desc) }

  def to_partial_path
    'course/announcements/announcement'
  end
end
