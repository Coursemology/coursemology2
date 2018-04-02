# frozen_string_literal: true
class Course::AnnouncementNotifier < Notifier::Base
  # To be called when an announcement is made.
  def new_announcement(user, announcement)
    email_enabled = Course::Settings::AnnouncementsComponent.
                    email_enabled?(announcement.course, :new_announcement)

    create_activity(actor: user, object: announcement, event: :new).
      notify(announcement.course, :email).
      save if email_enabled
  end

  private

  # Create an email for the users of a course based on a given course notification record.
  # Overrides email_course in Notifier::Base to pass a custom layout for this notifier.
  #
  # @param [CourseNotification] notification The notification which is used to generate emails
  def email_course(notification)
    notification.course.users.each do |user|
      @pending_emails << ActivityMailer.email(recipient: user,
                                              notification: notification,
                                              view_path: notification_view_path(notification),
                                              layout_path: 'no_greeting_mailer')
    end
  end
end
