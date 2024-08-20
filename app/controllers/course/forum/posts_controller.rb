# frozen_string_literal: true
class Course::Forum::PostsController < Course::Forum::ComponentController
  before_action :load_topic
  authorize_resource :topic
  skip_authorize_resource :post, only: :toggle_answer
  before_action :authorize_locked_topic, only: [:create]

  include Course::Discussion::PostsConcern

  def create
    result = @post.class.transaction do
      raise ActiveRecord::Rollback unless @post.save && create_topic_subscription && update_topic_pending_status
      raise ActiveRecord::Rollback unless @topic.update_column(:latest_post_at, @post.created_at)

      true
    end

    if result
      send_created_notification(@post)
      render 'create'
    else
      render json: { errors: @post.errors.full_messages.to_sentence }, status: :bad_request
    end
  end

  def update
    if @post.update(post_params)
      render partial: 'post_list_data', locals: { forum: @forum, topic: @topic, post: @post }
    else
      render json: { errors: @post.errors.full_messages.to_sentence }, status: :bad_request
    end
  end

  def vote
    @post.cast_vote!(current_user, post_vote_param)
    render partial: 'post_list_data', locals: { forum: @forum, topic: @topic, post: @post }
  end

  # Mark/unmark the post as the correct answer
  def toggle_answer
    authorize!(:toggle_answer, @topic)
    if @post.toggle_answer
      render json: { isTopicResolved: @topic.reload.resolved? }
    else
      render json: { errors: @post.errors.full_messages.to_sentence }, status: :bad_request
    end
  end

  def destroy
    if @topic.posts.count == 1 && @topic.destroy
      render json: { isTopicDeleted: true }
    elsif @post.destroy
      @topic.update_column(:latest_post_at, @topic.posts.last&.created_at || @topic.created_at)
      @topic.specific.update_resolve_status if @topic.topic_type == 'question' && @post.answer
      render json: { topicId: @topic.id,
                     postTreeIds: @topic.posts.ordered_topologically.sorted_ids,
                     isTopicResolved: @topic.reload.resolved? }
    else
      render json: { errors: @post.errors.full_messages.to_sentence }, status: :bad_request
    end
  end

  protected

  def create_topic_subscription
    if @forum.forum_topics_auto_subscribe
      @topic.ensure_subscribed_by(current_user)
    else
      true
    end
  end

  def discussion_topic
    @topic.acting_as
  end

  def skip_update_topic_status
    true
  end

  private

  def topic_id_param
    params.permit(:topic_id)[:topic_id]
  end

  def load_topic
    @topic ||= @forum.topics.friendly.find(topic_id_param)
  end

  def post_vote_param
    params.permit(:vote)[:vote].to_i
  end

  def send_created_notification(post)
    return unless current_user

    Course::Forum::PostNotifier.post_replied(current_user, current_course_user, post)
  end

  def authorize_locked_topic
    authorize!(:reply, @topic)
  end
end
