# frozen_string_literal: true
class Course::Assessment::SubmissionQuestion::CommentNotifier < Notifier::Base
  # To be called when user comments on an submission_question.
  def post_replied(user, post)
    return unless email_enabled?(post)

    activity = create_activity(actor: user, object: post, event: :replied)
    post.topic.subscriptions.includes(:user).each do |subscription|
      activity.notify(subscription.user, :email) unless subscription.user == user
    end
    activity.save!
  end

  private

  def email_enabled?(post)
    category = post.topic.actable.submission.assessment.tab.category
    Course::Settings::AssessmentsComponent.email_enabled?(category, :new_comment)
  end

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
