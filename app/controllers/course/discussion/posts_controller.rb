# frozen_string_literal: true
class Course::Discussion::PostsController < Course::ComponentController
  before_action :load_topic
  authorize_resource :specific_topic

  helper Course::Discussion::TopicsHelper.name.sub(/Helper$/, '')
  include Course::Discussion::PostsConcern

  def create
    # Set parent as the topologically last pre-existing post, if it exists.
    # @post is in @topic.posts, so we filter out @post, which has no id yet.
    if @topic.posts.length > 1
      @post.parent = @topic.posts.ordered_topologically.flatten.select(&:id).last
    end
    if super
      send_created_notification(@post)
    else
      head :bad_request
    end
  end

  def update
    if super
      respond_to do |format|
        format.js
        format.json { head :ok }
      end
    else
      head :bad_request
    end
  end

  def destroy
    if super
      respond_to do |format|
        format.js
        format.json { head :ok }
      end
    else
      head :bad_request
    end
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
