class Course::Forum::PostNotifier < Notifier::Base
  # To be called when user replied a forum post.
  def post_replied(user, post)
    activity = create_activity(actor: user, object: post, event: :replied)
    activity.notify(post.topic.actable.forum.course, :feed)
    post.topic.subscriptions.includes(:user).each do |subscription|
      activity.notify(subscription.user, :email) unless subscription.user == user
    end
    activity.save!
  end
end
