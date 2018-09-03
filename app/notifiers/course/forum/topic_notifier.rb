# frozen_string_literal: true
class Course::Forum::TopicNotifier < Notifier::Base
  # To be called when user created a new forum topic.
  def topic_created(user, course_user, topic)
    course = topic.forum.course
    activity = create_activity(actor: user, object: topic, event: :created)
    activity.notify(course, :feed) unless course_user.phantom?

    if Course::Settings::ForumsComponent.email_enabled?(course, :topic_created)
      topic.forum.subscriptions.includes(:user).each do |subscription|
        activity.notify(subscription.user, :email) unless subscription.user == user
      end
    end
    activity.save!
  end
end
