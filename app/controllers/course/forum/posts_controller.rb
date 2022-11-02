# frozen_string_literal: true
class Course::Forum::PostsController < Course::Forum::ComponentController
  before_action :load_topic
  authorize_resource :topic
  skip_authorize_resource :post, only: :toggle_answer
  before_action :authorize_locked_topic, only: [:create]
  before_action :add_topic_breadcrumb

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
      render partial: 'post_list_data', locals: { post: @post }, status: :ok
    else
      render json: { errors: @post.errors.full_messages.to_sentence }, status: :bad_request
    end
  end

  def vote
    @post.cast_vote!(current_user, post_vote_param)
    render partial: 'post_list_data', locals: { post: @post }, status: :ok
  end

  # Mark/unmark the post as the correct answer
  def toggle_answer
    authorize!(:toggle_answer, @topic)
    if @post.toggle_answer
      head :ok
    else
      render json: { errors: @post.errors.full_messages.to_sentence }, status: :bad_request
    end
  end

  def destroy
    if @topic.posts.count == 1 && @topic.destroy
      render json: { isTopicDeleted: true }, status: :ok
    elsif @post.destroy
      @topic.update_column(:latest_post_at, @topic.posts.last&.created_at || @topic.created_at)
      render json: { topicId: @topic.id, postTreeIds: @topic.posts.ordered_topologically.sorted_ids }
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

  def add_topic_breadcrumb
    add_breadcrumb @topic.title, course_forum_topic_path(current_course, @forum, @topic)
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
