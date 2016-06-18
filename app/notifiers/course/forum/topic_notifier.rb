class Course::Forum::TopicNotifier < Notifier::Base
  # To be called when user created a new forum topic.
  def topic_created(user, topic)
    create_activity(actor: user, object: topic, event: :created).
      notify(topic.forum.course, :feed).
      save
  end
end
