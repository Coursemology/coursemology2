class Course::Video::ReminderService
  class << self
    delegate :closing_reminder, to: :new
  end

  def closing_reminder(user, video, token)
    return unless video.closing_reminder_token == token && video.published?

    Course::VideoNotifier.video_closing(user, video)
  end
end
