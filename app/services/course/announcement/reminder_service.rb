# frozen_string_literal: true
class Course::Announcement::ReminderService
  class << self
    delegate :opening_reminder, to: :new
  end

  def opening_reminder(user, announcement, token)
    return unless announcement.opening_reminder_token == token

    Course::AnnouncementNotifier.new_announcement(user, announcement)
  end
end
