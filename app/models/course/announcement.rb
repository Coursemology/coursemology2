# frozen_string_literal: true
class Course::Announcement < ApplicationRecord
  include AnnouncementConcern
  include CourseConcern::OpeningReminderConcern

  acts_as_readable on: :updated_at
  has_many_attachments on: :content

  before_save :sanitize_text

  validates :title, length: { maximum: 255 }, presence: true
  validates :sticky, inclusion: { in: [true, false] }
  validates :start_at, presence: true
  validates :end_at, presence: true
  validates :opening_reminder_token, numericality: true, allow_nil: true
  validates :creator, presence: true
  validates :updater, presence: true
  validates :course, presence: true

  belongs_to :course, inverse_of: :announcements

  def sanitize_text
    self.content = ApplicationController.helpers.sanitize_ckeditor_rich_text(content)
  end
end
