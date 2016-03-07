# frozen_string_literal: true
class Course::Announcement < ActiveRecord::Base
  acts_as_readable on: :updated_at

  after_initialize :set_defaults, if: :new_record?
  after_create :mark_as_read_by_creator
  after_update :mark_as_read_by_updater

  belongs_to :course, inverse_of: :announcements

  scope :sorted_by_date, -> { order(start_at: :desc) }
  scope :sorted_by_sticky, -> { order(sticky: :desc) }

  def to_partial_path
    'course/announcements/announcement'
  end

  private

  # Set default values
  def set_defaults
    self.start_at ||= Time.zone.now
    self.end_at ||= 7.days.from_now
  end

  # Mark announcement as read for the creator
  def mark_as_read_by_creator
    mark_as_read! for: creator
  end

  # Mark announcement as read for the updater
  def mark_as_read_by_updater
    mark_as_read! for: updater
  end
end
