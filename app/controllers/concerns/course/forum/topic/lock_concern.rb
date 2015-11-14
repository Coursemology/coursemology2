module Course::Forum::Topic::LockConcern
  extend ActiveSupport::Concern

  def set_locked
    state = lock

    if @topic.save
      redirect_to course_forum_topic_path(@course, @forum, @topic),
                  success: t('course.forum.topics.locked.success', state: state)
    else
      redirect_to course_forum_topic_path(@course, @forum, @topic),
                  danger: t('course.forum.topics.locked.failure', state: state)
    end
  end

  private

  def lock
    authorize! :set_locked, @topic
    @topic.locked = params[:option]
    @topic.locked ? t('course.forum.topics.locked.state') : t('course.forum.topics.unlocked.state')
  end
end
