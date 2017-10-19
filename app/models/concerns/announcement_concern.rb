# frozen_string_literal: true
#
# Concern of common methods for the announcements - GenericAnnouncement and Course::Announcement.
module AnnouncementConcern
  extend ActiveSupport::Concern

  included do
    after_initialize :set_defaults, if: :new_record?
    after_create :mark_as_read_by_creator
    after_update :mark_as_read_by_updater

    validate :validate_start_at_cannot_be_after_end_at
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

  def validate_start_at_cannot_be_after_end_at
    return unless end_at && start_at && start_at > end_at
    errors.add(:start_at, :cannot_be_after_end_at)
  end
end
