# frozen_string_literal: true
class Course::Video::ReminderService
  class << self
    delegate :closing_reminder, to: :new
  end

  def closing_reminder(video, token)
    email_enabled = video.course.email_enabled(:videos, :closing_reminder)
    return unless video.closing_reminder_token == token && video.published?
    return unless email_enabled.phantom || email_enabled.regular

    unattempted_subscribed_students(video, email_enabled).each do |student|
      Course::Mailer.video_closing_reminder_email(student.user, video).deliver_later
    end
  end

  private

  # rubocop:disable Metrics/AbcSize
  def unattempted_subscribed_students(video, email_enabled)
    course_users = video.course.course_users
    students = if email_enabled.regular && email_enabled.phantom
                 course_users.student.includes(:user)
               elsif email_enabled.regular
                 course_users.student.without_phantom_users.includes(:user)
               else
                 course_users.student.phantom.includes(:user)
               end

    submitted = video.submissions.includes(:creator).map(&:creator)
    unsubscribed =
      students.joins(:email_unsubscriptions).
      where('course_user_email_unsubscriptions.course_settings_email_id = ?', email_enabled.id)

    Set.new(students) - Set.new(submitted) - Set.new(unsubscribed)
  end
  # rubocop:enable Metrics/AbcSize
end
