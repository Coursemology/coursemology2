class Course::Forum::PostNotifier < Notifier::Base
  # To be called when user replied a forum post.
  def post_replied(user, post)
    activity = create_activity(actor: user, object: post, event: :replied)
    activity.notify(post.topic.actable.forum.course, :feed)
    topic_subscriptions = post.topic.subscriptions.includes(:user)
    forum_subscriptions = post.topic.actable.forum.subscriptions.includes(:user)

    # Send notification to both forum and topic subscribers
    Set.new(topic_subscriptions + forum_subscriptions).each { |s| activity.notify(s.user, :email) }
    activity.save!
  end
end
