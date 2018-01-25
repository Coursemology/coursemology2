# frozen_string_literal: true
# The mailer for Consolidated Opening Reminders.
#
# @api private
class ConsolidatedOpeningReminderMailer < ActivityMailer
  helper ConsolidatedOpeningReminderMailerHelper

  # Emails a recipient, informing him of the upcoming items which are starting
  # for a particular course.
  #
  # @param [User] recipient The recipient of the email.
  # @param [Course::Notification|UserNotification] notification The notification to be made
  #   available to the view, accessible using +@notification+.
  # @param [String] view_path The path to the view which should be rendered.
  # @param [String] layout_path The filename in app/views/layouts which should be rendered.
  #   If not specified, the 'mailer' layout specified in ApplicationMailer is used.
  def email(recipient:, notification:, view_path:, layout_path: nil)
    ActsAsTenant.without_tenant do
      @recipient = recipient
      @notification = notification
      @course = notification.activity.object
      @layout = layout_path
      @items_hash = Course::LessonPlan::Item.upcoming_items_from_course_by_type(@course)
      # Lesson plan item start at times could have been changed between the time the mailer job
      # was enqueued and the time this function is called to render the email.
      # Return if there are no items so a consolidated email with no items doesn't get sent.
      return if @items_hash.empty?

      mail(to: recipient.email, template: view_path)
    end
  end
end
