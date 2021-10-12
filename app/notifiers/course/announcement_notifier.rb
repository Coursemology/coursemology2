# frozen_string_literal: true
class Course::AnnouncementNotifier < Notifier::Base
  # To be called when an announcement is made.
  def new_announcement(user, announcement)
    email_enabled = announcement.course.email_enabled(:announcements, :new_announcement)
    return unless email_enabled.regular || email_enabled.phantom

    create_activity(actor: user, object: announcement, event: :new).
      notify(announcement.course, :email).
      save
  end

  private

  # Create an email for the users of a course based on a given course notification record.
  # Overrides email_course in Notifier::Base to pass a custom layout for this notifier.
  #
  # @param [CourseNotification] notification The notification which is used to generate emails
  def email_course(notification)
    email_enabled = notification.course.email_enabled(:announcements, :new_announcement)
    notification.course.course_users.each do |course_user|
      next if course_user.email_unsubscriptions.where(course_settings_email_id: email_enabled.id).exists?
      next if course_user.phantom? && !email_enabled.phantom
      next if !course_user.phantom? && !email_enabled.regular

      @pending_emails << ActivityMailer.email(recipient: course_user.user,
                                              notification: notification,
                                              view_path: notification_view_path(notification),
                                              layout_path: 'no_greeting_mailer')
    end
  end
end
