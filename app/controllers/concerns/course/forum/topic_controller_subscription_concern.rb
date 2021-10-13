# frozen_string_literal: true
module Course::Forum::TopicControllerSubscriptionConcern
  extend ActiveSupport::Concern

  def subscribe
    authorize!(:read, @topic)

    if set_subscription_state
      flash.now[:success] = subscription_state_text(true)
      render 'course/forum/topics/update_subscribe_button'
    else
      flash.now[:danger] = subscription_state_text(false)
      render 'course/forum/topics/update_subscribe_button'
    end
  end

  private

  def subscription_state_text(successful)
    case [subscribe?, successful]
    when [true, true]
      t('course.forum.topics.subscribe.success', topic: @topic.title)
    when [true, false]
      t('course.forum.topics.subscribe.failure', topic: @topic.title)
    when [false, true]
      t('course.forum.topics.unsubscribe.success', topic: @topic.title)
    when [false, false]
      t('course.forum.topics.unsubscribe.failure', topic: @topic.title)
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
