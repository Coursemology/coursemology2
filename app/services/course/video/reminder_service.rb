class Course::Video::ReminderService
  class << self
    delegate :opening_reminder, to: :new
    delegate :closing_reminder, to: :new
  end

  def opening_reminder(user, video, start_at)
    return unless start_at.round(4) == video.start_at.to_f.round(4) && video.published?

    Course::VideoNotifier.video_opening(user, video)
  end

  def closing_reminder(user, video, end_at)
    return unless end_at.round(4) == video.end_at.to_f.round(4) && video.published?

    Course::VideoNotifier.video_closing(user, video)
  end
end
