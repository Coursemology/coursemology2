# frozen_string_literal: true
class Course::Assessment::Submission::Answer::CommentsController < \
  Course::Assessment::Submission::Answer::Controller

  include Course::Discussion::PostsConcern
  helper Course::Assessment::Submission::SubmissionsHelper.name.sub(/Helper$/, '')

  delegate :discussion_topic, to: :@answer

  def create
    @answer.class.transaction do
      @post.title = @assessment.title
      # Set parent as the topologically last pre-existing post, if it exists.
      # @post is in @answer.posts, so we filter out @post, which has no id yet.
      if @answer.posts.length > 1
        @post.parent = @answer.posts.ordered_topologically.flatten.select(&:id).last
      end
      if super && @answer.save
        send_created_notification(@post)
      else
        render status: :bad_request
      end
    end
  end

  private

  def create_topic_subscription
    @discussion_topic.ensure_subscribed_by(current_user)
    # Ensure answer's creator gets a notification when someone comments on this answer
    @discussion_topic.ensure_subscribed_by(@answer.submission.creator)
  end

  def send_created_notification(post)
    if current_course_user && !current_course_user.phantom?
      post.topic.actable.notify(post)
    end
  end
end
