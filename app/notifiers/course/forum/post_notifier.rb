class Course::Forum::PostNotifier < Notifier::Base
  # To be called when user replied a forum post.
  def post_replied(user, post)
    activity = create_activity(actor: user, object: post, event: :replied)
    activity.notify(post.topic.actable.forum.course, :feed)
    post.topic.subscriptions.includes(:user).each { |s| activity.notify(s.user, :email) }
    activity.save!
  end
end
