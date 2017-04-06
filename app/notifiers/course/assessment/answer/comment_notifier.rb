class Course::Assessment::Answer::CommentNotifier < Notifier::Base
  # To be called when user adds a post to a programming annotation.
  def annotation_replied(user, post)
    activity = create_activity(actor: user, object: post, event: :annotated)
    post.topic.subscriptions.includes(:user).each do |subscription|
      activity.notify(subscription.user, :email) unless subscription.user == user
    end
    activity.save!
  end
end
