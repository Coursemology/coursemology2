# frozen_string_literal: true
class Course::VideoNotifier < Notifier::Base
  def video_attempted(user, video)
    create_activity(actor: user, object: video, event: :attempted).
      notify(video.course, :feed).
      save!
  end

  def video_closing(user, video)
    return unless email_enabled?(video, :video_closing)

    activity = create_activity(actor: user, object: video, event: :closing)
    unattempted_users(video).each { |u| activity.notify(u, :email) }
    activity.save!
  end

  private

  def email_enabled?(video, key)
    Course::Settings::VideosComponent.email_enabled?(video.course, key)
  end

  def unattempted_users(video)
    students = video.course.course_users.student.includes(:user).map(&:user)
    submitted = video.submissions.includes(:creator).map(&:creator)
    Set.new(students) - Set.new(submitted)
  end
end
