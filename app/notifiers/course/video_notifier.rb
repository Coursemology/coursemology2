# frozen_string_literal: true
class Course::VideoNotifier < Notifier::Base
  def video_attempted(user, video)
    create_activity(actor: user, object: video, event: :attempted).
      notify(video.course, :feed).
      save!
  end

end
