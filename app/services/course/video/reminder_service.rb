class Course::Video::ReminderService
  class << self
    delegate :opening_reminder, to: :new
    delegate :closing_reminder, to: :new
  end

  def opening_reminder(user, video, token)
    return unless video.opening_reminder_token == token && video.published?

    Course::VideoNotifier.video_opening(user, video)
  end

  def closing_reminder(user, video, token)
    return unless video.closing_reminder_token == token && video.published?

    Course::VideoNotifier.video_closing(user, video)
  end
end
