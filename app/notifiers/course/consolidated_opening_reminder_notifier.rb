# frozen_string_literal: true
class Course::ConsolidatedOpeningReminderNotifier < Notifier::Base
  # Create an opening reminder activity if there are upcoming items for the course.
  def opening_reminder(course)
    return unless course.upcoming_lesson_plan_items_exist?

    create_activity(actor: User.system, object: course, event: :opening_reminder).
      notify(course, :email).save
  end

  private

  # Create an email for the users of a course based on a given course notification record.
  # Overrides email_course in Notifier::Base to pass a custom layout for this notifier.
  #
  # @param [CourseNotification] notification The notification which is used to generate emails
  def email_course(notification)
    notification.course.users.each do |user|
      @pending_emails <<
        ConsolidatedOpeningReminderMailer.email(recipient: user,
                                                notification: notification,
                                                view_path: notification_view_path(notification),
                                                layout_path: 'no_greeting_mailer')
    end
  end
end
