class Course::Forum::PostNotifier < Notifier::Base
  # To be called when user replied a forum post.
  def post_replied(user, post)
    create_activity(actor: user, object: post, event: :replied).
      notify(post.topic.actable.forum.course, :feed).
      save!
  end
end
