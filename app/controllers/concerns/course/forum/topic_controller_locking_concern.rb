# frozen_string_literal: true
module Course::Forum::TopicControllerLockingConcern
  extend ActiveSupport::Concern

  def set_locked
    if @topic.update(locked_params)
      redirect_to course_forum_topic_path(current_course, @forum, @topic),
                  success: locked_state_text(true)
    else
      redirect_to course_forum_topic_path(current_course, @forum, @topic),
                  danger: locked_state_text(false)
    end
  end

  private

  def locked_params
    params.permit(:locked)
  end

  def locked_state_text(successful)
    case [@topic.locked, successful]
    when [true, true]
      t('course.forum.topics.locked.success')
    when [true, false]
      t('course.forum.topics.locked.failure')
    when [false, true]
      t('course.forum.topics.unlocked.success')
    when [false, false]
      t('course.forum.topics.unlocked.failure')
    end
  end
end
