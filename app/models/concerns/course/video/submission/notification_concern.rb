# frozen_string_literal: true
module Course::Video::Submission::NotificationConcern
  extend ActiveSupport::Concern

  included do
    after_create :send_attempt_notification
  end

  private

  def send_attempt_notification
    return unless course_user.real_student?

    Course::VideoNotifier.video_attempted(creator, video)
  end
end
