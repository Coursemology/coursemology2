module Course::Forum::Topic::SubscribeConcern
  extend ActiveSupport::Concern

  def subscribe
    redirect_path = course_forum_topic_path(current_course, @forum, @topic)
    if @topic.subscriptions.create(user: current_user)
      redirect_to redirect_path, success: t('course.forum.topics.subscribe.success',
                                            title: @topic.title)
    else
      redirect_to redirect_path, danger: t('course.forum.topics.subscribe.failure',
                                           error: @topic.errors.full_messages.to_sentence)
    end
  end

  def unsubscribe
    redirect_path = course_forum_topic_path(current_course, @forum, @topic)
    if @topic.subscriptions.where(user: current_user).destroy_all
      redirect_to redirect_path, success: t('course.forum.topics.unsubscribe.success',
                                            title: @topic.title)
    else
      redirect_to redirect_path, danger: t('course.forum.topics.unsubscribe.failure',
                                           error: @topic.errors.full_messages.to_sentence)
    end
  end
end
