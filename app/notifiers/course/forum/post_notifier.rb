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
    activity = create_activity(actor: user, object: post, event: :replied)
    activity.notify(course, :feed) if course_user && !course_user.phantom?

    if email_notification_enabled?(course_user)
      post.topic.subscriptions.includes(:user).each do |subscription|
        activity.notify(subscription.user, :email) unless subscription.user == user
      end
    end

    activity.save!
  end

  private

  def email_notification_enabled?(course_user)
    course = course_user.course

    response = settings_with_key(course, :post_replied)
    response &&= settings_with_key(course, :post_phantom_replied) if course_user&.phantom?
    response
  end

  def settings_with_key(course, key)
    Course::Settings::ForumsComponent.email_enabled?(course, key)
  end
end
