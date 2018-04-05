# frozen_string_literal: true
class Course::Forum::PostNotifier < Notifier::Base
  # To be called when user replied a forum post.
  def post_replied(user, post)
    course = post.topic.actable.forum.course
    activity = create_activity(actor: user, object: post, event: :replied)
    activity.notify(course, :feed)
    if Course::Settings::ForumsComponent.email_enabled?(course, :post_replied)
      post.topic.subscriptions.includes(:user).each do |subscription|
        activity.notify(subscription.user, :email) unless subscription.user == user
      end
    end
    activity.save!
  end
end
