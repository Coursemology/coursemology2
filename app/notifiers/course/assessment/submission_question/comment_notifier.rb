class Course::Assessment::SubmissionQuestion::CommentNotifier < Notifier::Base
  # To be called when user comments on an submission_question.
  def post_replied(user, post)
    activity = create_activity(actor: user, object: post, event: :replied)
    post.topic.subscriptions.includes(:user).each do |subscription|
      activity.notify(subscription.user, :email) unless subscription.user == user
    end
    activity.save!
  end
end
