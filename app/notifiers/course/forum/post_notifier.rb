# frozen_string_literal: true
class Course::Forum::PostNotifier < Notifier::Base
  # Called when a user replies to a forum post.
  #
  # @param[User] User who replied to the forum post
  # @param[CourseUser] course_user The course_user who replied to the forum post.
  #   This can be +nil+ in exceptional cases where the administrator posts to a forum.
  # @param[Course::Discussion::Post] post The post that was created.
  def post_replied(user, course_user, post)
    course = post.topic.course
    email_enabled = course.email_enabled(:forums, :post_replied)
    return unless email_enabled.regular || email_enabled.phantom

    activity = create_activity(actor: user, object: post, event: :replied)
    activity.notify(course, :feed) if course_user && !course_user.phantom?

    post.topic.subscriptions.includes(:user).each do |subscription|
      course_user = course.course_users.find_by(user: subscription.user)
      is_disabled_as_phantom = course_user.phantom? && !email_enabled.phantom
      is_disabled_as_regular = !course_user.phantom? && !email_enabled.regular
      exclude_user = subscription.user == user ||
                     is_disabled_as_phantom ||
                     is_disabled_as_regular ||
                     course_user.email_unsubscriptions.where(course_settings_email_id: email_enabled.id).exists?

      activity.notify(subscription.user, :email) unless exclude_user
    end
    activity.save!
  end
end
