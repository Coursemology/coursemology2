# frozen_string_literal: true
class Course::Forum::PostsController < Course::Forum::ComponentController
  before_action :load_topic
  authorize_resource :topic
  before_action :authorize_locked_topic, only: [:create]
  before_action :add_topic_breadcrumb

  include Course::Discussion::PostsConcern

  def create
    if super
      # Update parent topic updated_at to invalidate all read marks
      @topic.touch
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
    if super
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

  def destroy
    if super
      redirect_to course_forum_topic_path(current_course, @forum, @topic),
                  success: t('course.discussion.posts.destroy.success')
    else
      redirect_to course_forum_topic_path(current_course, @forum, @topic),
                  danger: t('course.discussion.posts.destroy.failure',
                            error: @post.errors.full_messages.to_sentence)
    end
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
    if current_course_user && !current_course_user.phantom?
      Course::Forum::PostNotifier.post_replied(current_user, post)
    end
  end

  def authorize_locked_topic
    authorize!(:reply, @topic)
  end
end
