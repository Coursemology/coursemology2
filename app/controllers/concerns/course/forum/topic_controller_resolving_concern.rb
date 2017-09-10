# frozen_string_literal: true
module Course::Forum::TopicControllerResolvingConcern
  extend ActiveSupport::Concern

  def set_resolved
    authorize!(:resolve, @topic)
    if @topic.update_attributes(resolved_params)
      redirect_to course_forum_topic_path(current_course, @forum, @topic),
                  success: resolved_state_text(true)
    else
      redirect_to course_forum_topic_path(current_course, @forum, @topic),
                  danger: resolved_state_text(false)
    end
  end

  private

  def resolved_params
    params.permit(:resolved)
  end

  def resolved_state_text(successful)
    case [@topic.resolved, successful]
    when [true, true]
      t('course.forum.topics.resolved.success')
    when [true, false]
      t('course.forum.topics.resolved.failure')
    when [false, true]
      t('course.forum.topics.unresolved.success')
    when [false, false]
      t('course.forum.topics.unresolved.failure')
    end
  end
end
