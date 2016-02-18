# frozen_string_literal: true
class Course::Forum::PostsController < Course::Forum::Controller
  before_action :load_topic
  authorize_resource :topic

  include Course::Discussion::PostsConcern

  def create
    if super
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

  private

  def topic_id_param
    params.permit(:topic_id)[:topic_id]
  end

  def load_topic
    @topic ||= @forum.topics.friendly.find(topic_id_param)
  end
end
