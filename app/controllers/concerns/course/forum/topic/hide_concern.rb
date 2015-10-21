module Course::Forum::Topic::HideConcern
  extend ActiveSupport::Concern

  def set_hidden
    state = hide

    if @topic.save
      redirect_to course_forum_topic_path(@course, @forum, @topic),
                  success: t('course.forum.topics.hidden.success', state: state)
    else
      redirect_to course_forum_topic_path(@course, @forum, @topic),
                  danger: t('course.forum.topics.hidden.failure', state: state)
    end
  end

  private

  def hide
    authorize! :set_hidden, @topic
    @topic.hidden = params[:option]
    @topic.hidden ? t('course.forum.topics.hidden.state') : t('course.forum.topics.shown.state')
  end
end
