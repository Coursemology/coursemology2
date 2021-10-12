# frozen_string_literal: true
class Course::Assessment::SubmissionQuestion::CommentNotifier < Notifier::Base
  # Called when a user comments on an submission_question.
  #
  # @param[Course::Discussion::Post] post The post that was created.
  def post_replied(post)
    category = post.topic.actable.submission.assessment.tab.category
    email_enabled = category.course.email_enabled(:assessments, :new_comment, category.id)
    return unless email_enabled.regular || email_enabled.phantom

    user = post.creator
    activity = create_activity(actor: user, object: post, event: :replied)

    post.topic.subscriptions.includes(:user).each do |subscription|
      course_user = category.course.course_users.find_by(user: subscription.user)
      exclude_user = subscription.user == user ||
                     (course_user.phantom? && !email_enabled.phantom) ||
                     (!course_user.phantom? && !email_enabled.regular) ||
                     course_user.email_unsubscriptions.where(course_settings_email_id: email_enabled.id).exists?

      activity.notify(subscription.user, :email) unless exclude_user
    end
    activity.save!
  end

  private

  # Create an email for a user based on a given user notification record.
  # Overrides email_user in Notifier::Base to pass a custom layout for this notifier.
  #
  # @param [UserNotification] notification The notification which is used to generate the email
  def email_user(notification)
    @pending_emails << ActivityMailer.email(recipient: notification.user,
                                            notification: notification,
                                            view_path: notification_view_path(notification),
                                            layout_path: 'no_greeting_mailer')
  end
end
