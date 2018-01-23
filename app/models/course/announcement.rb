# frozen_string_literal: true
class Course::Announcement < ApplicationRecord
  include AnnouncementConcern
  include Course::OpeningReminderConcern

  acts_as_readable on: :updated_at
  has_many_attachments on: :content

  belongs_to :course, inverse_of: :announcements

  scope :sorted_by_date, -> { order(start_at: :desc) }
  scope :sorted_by_sticky, -> { order(sticky: :desc) }

  def to_partial_path
    'course/announcements/announcement'
  end
end
