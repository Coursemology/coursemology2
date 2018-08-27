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
      redirect_to course_forum_topic_path(current_course, @forum, @topic),
                  success: t('course.discussion.posts.create.success')
    else
      redirect_to course_forum_topic_path(current_course, @forum, @topic),
                  danger: t('course.discussion.posts.create.failure',
                            error: @post.errors.full_messages.to_sentence)
    end
  end

  def update
    if @post.update_attributes(post_params)
      redirect_to course_forum_topic_path(current_course, @forum, @topic),
                  success: t('course.discussion.posts.update.success')
    else
      render 'edit'
    end
  end

  def vote
    @post.cast_vote!(current_user, post_vote_param)
    redirect_to course_forum_topic_path(current_course, @forum, @topic),
                success: t('.success')
  end

  # Mark/unmark the post as the correct answer
  def toggle_answer
    authorize!(:toggle_answer, @topic)
    if @post.toggle_answer
      redirect_to course_forum_topic_path(current_course, @forum, @topic), success: t('.success')
    else
      redirect_to course_forum_topic_path(current_course, @forum, @topic),
                  danger: @post.errors.full_messages.to_sentence
    end
  end

  def destroy
    if @topic.posts.count == 1 && @topic.destroy
      redirect_to course_forum_path(current_course, @forum),
                  success: t('course.forum.topics.destroy.success', title: @topic.title)
    elsif @post.destroy
      @topic.update_column(:latest_post_at, @topic.posts.last&.created_at || @topic.created_at)
      redirect_to course_forum_topic_path(current_course, @forum, @topic),
                  success: t('course.discussion.posts.destroy.success')
    else
      redirect_to course_forum_topic_path(current_course, @forum, @topic),
                  danger: t('course.discussion.posts.destroy.failure',
                            error: @post.errors.full_messages.to_sentence)
    end
  end

  # Render a new post in a separate page
  def reply
    node = @post
    @post_chain = [node]
    # Show up to reply-post + 2 parent posts
    2.times do
      break if node.parent.nil?
      @post_chain << node.parent
      node = node.parent
    end
    @post_chain = @post_chain.reverse
    @reply_post = @post.children.build
  end

  protected

  def create_topic_subscription
    @topic.ensure_subscribed_by(current_user)
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
    return unless current_course_user && !current_course_user.phantom?
    Course::Forum::PostNotifier.post_replied(current_user, post)
  end

  def authorize_locked_topic
    authorize!(:reply, @topic)
  end
end
