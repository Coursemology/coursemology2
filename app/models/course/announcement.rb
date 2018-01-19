# frozen_string_literal: true
class Course::Announcement < ApplicationRecord
  include AnnouncementConcern
  include Course::ReminderConcern

  acts_as_readable on: :updated_at
  has_many_attachments on: :content

  belongs_to :course, inverse_of: :announcements

  scope :sorted_by_date, -> { order(start_at: :desc) }
  scope :sorted_by_sticky, -> { order(sticky: :desc) }

  def to_partial_path
    'course/announcements/announcement'
  end

  private

  # Override this function from the ReminderConcern as we don't want closing reminders
  # from announcements
  def setup_closing_reminders; end
end
