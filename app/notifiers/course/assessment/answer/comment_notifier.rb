# frozen_string_literal: true
class Course::Assessment::Answer::CommentNotifier < Notifier::Base
  # Called when a user adds a post to a programming annotation.
  #
  # @param[Course::Discussion::Post] post The post that was created.
  def annotation_replied(post)
    category = post.topic.actable.file.answer.submission.assessment.tab.category
    email_enabled = category.course.email_enabled(:assessments, :new_comment, category.id)
    return unless email_enabled.regular || email_enabled.phantom

    user = post.creator
    activity = create_activity(actor: user, object: post, event: :annotated)

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
end
