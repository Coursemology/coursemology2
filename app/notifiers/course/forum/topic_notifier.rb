class Course::Forum::TopicNotifier < Notifier::Base
  # To be called when user created a new forum topic.
  def topic_created(user, topic)
    activity = create_activity(actor: user, object: topic, event: :created)
    activity.notify(topic.forum.course, :feed)
    topic.forum.subscriptions.includes(:user).each { |s| activity.notify(s.user, :email) }
    activity.save!
  end
end
