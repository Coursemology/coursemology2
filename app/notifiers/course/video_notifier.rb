# frozen_string_literal: true
class Course::VideoNotifier < Notifier::Base
  def video_attempted(user, video)
    create_activity(actor: user, object: video, event: :attempted).
      notify(video.course, :feed).
      save!
  end

  def video_closing(user, video)
    email_enabled = video.course.email_enabled(:videos, :closing_reminder)
    return unless email_enabled.phantom || email_enabled.regular

    activity = create_activity(actor: user, object: video, event: :closing)
    unattempted_subscribed_users(video).each { |u| activity.notify(u, :email) }
    activity.save!
  end

  private

  def unattempted_subscribed_users(video)
    course_users = video.course.course_users
    email_enabled = video.course.email_enabled(:videos, :closing_reminder)
    if email_enabled.regular && email_enabled.phantom
      students = course_users.student.includes(:user)
    elsif email_enabled.regular
      students = course_users.student.without_phantom_users.includes(:user)
    elsif email_enabled.phantom
      students = course_users.student.phantom.includes(:user)
    end
    submitted = video.submissions.includes(:creator).map(&:creator)
    unsubscribed = students.joins(:email_unsubscriptions).
                   where('course_user_email_unsubscriptions.course_settings_email_id = ?', email_enabled.id).
                   map(&:user)
    Set.new(students.map(&:user)) - Set.new(unsubscribed) - Set.new(submitted)
  end
end
