# frozen_string_literal: true
class Course::Discussion::PostsController < Course::ComponentController
  before_action :load_topic
  authorize_resource :specific_topic

  helper Course::Discussion::TopicsHelper.name.sub(/Helper$/, '')
  include Course::Discussion::PostsConcern

  def create
    if super
      send_created_notification(@post)
    else
      render status: :bad_request
    end
  end

  def update
    render status: :bad_request unless super
  end

  def destroy
    render status: :bad_request unless super
  end

  protected

  def discussion_topic
    @topic
  end

  def create_topic_subscription
    @topic.ensure_subscribed_by(current_user)
  end

  private

  def topic_id_param
    params.permit(:topic_id)[:topic_id]
  end

  def load_topic
    @topic ||= Course::Discussion::Topic.find(topic_id_param)
    @specific_topic = @topic.specific
  end

  def send_created_notification(post)
    if current_course_user && !current_course_user.phantom?
      post.topic.actable.notify(post)
    end
  end
end
