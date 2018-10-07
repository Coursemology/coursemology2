# frozen_string_literal: true
class Course::Announcement < ApplicationRecord
  include AnnouncementConcern
  include Course::OpeningReminderConcern

  acts_as_readable on: :updated_at
  has_many_attachments on: :content

  validates_length_of :title, allow_nil: true, maximum: 255
  validates_presence_of :title
  validates_inclusion_of :sticky, in: [true, false], message: :blank
  validates_presence_of :start_at
  validates_presence_of :end_at
  validates_numericality_of :opening_reminder_token, allow_nil: true
  validates_presence_of :creator
  validates_presence_of :updater
  validates_presence_of :course

  belongs_to :course, inverse_of: :announcements

  scope :sorted_by_date, -> { order(start_at: :desc) }
  scope :sorted_by_sticky, -> { order(sticky: :desc) }

  def to_partial_path
    'course/announcements/announcement'
  end
end
