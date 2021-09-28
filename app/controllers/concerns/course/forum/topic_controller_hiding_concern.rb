# frozen_string_literal: true
module Course::Forum::TopicControllerHidingConcern
  extend ActiveSupport::Concern

  def set_hidden
    if @topic.update(hidden_params)
      redirect_to course_forum_topic_path(current_course, @forum, @topic),
                  success: hidden_state_text(true)
    else
      redirect_to course_forum_topic_path(current_course, @forum, @topic),
                  danger: hidden_state_text(false)
    end
  end

  private

  def hidden_params
    params.permit(:hidden)
  end

  def hidden_state_text(successful)
    case [@topic.hidden, successful]
    when [true, true]
      t('course.forum.topics.hidden.success')
    when [true, false]
      t('course.forum.topics.hidden.failure')
    when [false, true]
      t('course.forum.topics.unhidden.success')
    when [false, false]
      t('course.forum.topics.unhidden.failure')
    end
  end
end
