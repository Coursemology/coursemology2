# frozen_string_literal: true
class Course::Assessment::SubmissionQuestion::CommentNotifier < Notifier::Base
  # Called when a user comments on an submission_question.
  #
  # @param[Course::Discussion::Post] post The post that was created.
  def post_replied(post)
    return unless email_notification_enabled?(post)

    user = post.creator
    activity = create_activity(actor: user, object: post, event: :replied)
    post.topic.subscriptions.includes(:user).each do |subscription|
      activity.notify(subscription.user, :email) unless subscription.user == user
    end
    activity.save!
  end

  private

  def email_notification_enabled?(post)
    course_user = CourseUser.find_by(user: post.creator, course: post.topic.course)
    category = post.topic.actable.submission.assessment.tab.category

    response = settings_with_key(category, :new_comment)
    response &&= settings_with_key(category, :new_phantom_comment) if course_user&.phantom?
    response
  end

  def settings_with_key(category, key)
    Course::Settings::AssessmentsComponent.email_enabled?(category, key)
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
