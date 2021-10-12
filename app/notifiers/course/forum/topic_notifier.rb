# frozen_string_literal: true
class Course::Forum::TopicNotifier < Notifier::Base
  # To be called when user created a new forum topic.
  def topic_created(user, course_user, topic)
    course = topic.forum.course
    email_enabled = course.email_enabled(:forums, :new_topic)
    return unless email_enabled.regular || email_enabled.phantom

    activity = create_activity(actor: user, object: topic, event: :created)
    activity.notify(course, :feed) unless course_user.phantom?

    topic.forum.subscriptions.includes(:user).each do |subscription|
      course_user = course.course_users.find_by(user: subscription.user)
      exclude_user = subscription.user == user ||
                     (course_user.phantom? && !email_enabled.phantom) ||
                     (!course_user.phantom? && !email_enabled.regular) ||
                     course_user.email_unsubscriptions.where(course_settings_email_id: email_enabled.id).exists?

      activity.notify(subscription.user, :email) unless exclude_user
    end
    activity.save!
  end
end
