# frozen_string_literal: true
# Preview all emails at http://localhost:3000/rails/mailers/activity_mailer
class ActivityMailerPreview < ActionMailer::Preview
  include ApplicationNotificationsHelper

  def email
    ActsAsTenant.without_tenant do
      # Get some test data for a consolidated opening reminder email preview.
      course = Course.find(6)
      user = course.users.first
      activity = Activity.new(actor: User.system,
                              object: course,
                              event: :opening_reminder,
                              notifier_type: 'Course::ConsolidatedOpeningReminderNotifier')
      notification = activity.notify(course, :email)

      # Preview the email to the first item.
      ActivityMailer.email(recipient: user,
                           notification: notification,
                           view_path: notification_view_path(notification),
                           layout_path: 'no_greeting_mailer')
    end
  end
end
