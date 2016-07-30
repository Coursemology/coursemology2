# frozen_string_literal: true
class Course::Assessment::Submission::Answer::CommentsController < \
  Course::Assessment::Submission::Answer::Controller

  include Course::Discussion::PostsConcern
  helper Course::Assessment::Submission::SubmissionsHelper.name.sub(/Helper$/, '')

  delegate :discussion_topic, to: :@answer

  def create
    @answer.class.transaction do
      @post.title = @assessment.title
      if super && @answer.save
      else
        render status: :bad_request
      end
    end
  end

  private

  def create_topic_subscription
    @discussion_topic.ensure_subscribed_by(current_user)
  end
end
