module Course::Forum::TopicControllerSubscriptionConcern
  extend ActiveSupport::Concern

  def subscribe
    authorize!(:read, @topic)

    if set_subscription_state
      redirect_to course_forum_topic_path(current_course, @forum, @topic),
                  success: subscription_state_text(true)
    else
      redirect_to course_forum_topic_path(current_course, @forum, @topic),
                  danger: subscription_state_text(false)
    end
  end

  private

  def subscription_state_text(successful)
    case [subscribe?, successful]
    when [true, true]
      t('course.forum.topics.subscribe.success')
    when [true, false]
      t('course.forum.topics.subscribe.failure')
    when [false, true]
      t('course.forum.topics.unsubscribe.success')
    when [false, false]
      t('course.forum.topics.unsubscribe.failure')
    end
  end

  def set_subscription_state
    if subscribe?
      @topic.subscriptions.create(user: current_user)
    else
      @topic.subscriptions.where(user: current_user).destroy_all
    end
  end

  def subscribe?
    params[:subscribe] == 'true'
  end
end
