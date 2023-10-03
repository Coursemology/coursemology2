# frozen_string_literal: true
class Course::Discussion::PostsController < Course::ComponentController
  include Signals::EmissionConcern

  before_action :load_topic
  authorize_resource :specific_topic

  helper Course::Discussion::TopicsHelper.name.sub(/Helper$/, '')
  include Course::Discussion::PostsConcern

  signals :comments, after: [:create, :destroy]

  def create
    result = @post.transaction do
      # Set parent as the topologically last pre-existing post, if it exists.
      # @post is in @topic.posts, so we filter out @post, which has no id yet.
      @post.parent = @topic.posts.ordered_topologically.flatten.select(&:id).last if @topic.posts.length > 1
      raise ActiveRecord::Rollback unless @post.save && create_topic_subscription && update_topic_pending_status

      true
    end

    if result
      send_created_notification(@post) if @post.published?
      respond_to do |format|
        format.json { render @post }
      end
    else
      head :bad_request
    end
  end

  def update
    if @post.update(post_params)
      respond_to do |format|
        # Change post creator from system to updater if it is a codaveri feedback
        # and send notification
        if @post.published? && @post.codaveri_feedback && @post.creator_id == 0
          @post.update(creator_id: current_user.id)
          update_topic_pending_status
          send_created_notification(@post)
        end
        format.json { render @post }
      end
    else
      head :bad_request
    end
  end

  def destroy
    if @post.destroy
      head :ok
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
    return unless current_course_user

    topic_actable = post.topic.actable
    topic_actable.notify(post) if topic_actable.respond_to?(:notify)
  end

  # @return [Course::Discussion::TopicsComponent]
  # @return [nil] If component is disabled.
  def component
    current_component_host[:course_discussion_topics_component]
  end
end
