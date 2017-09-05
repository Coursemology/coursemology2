# frozen_string_literal: true
module Course::Forum::ControllerHelper
  def link_to_next_unread
    link_to t('course.forum.forums.next_unread.title'),
            next_unread_course_forums_path(current_course),
            title: t('course.forum.forums.next_unread.description'),
            class: ['btn', 'btn-default']
  end

  def topic_type_icon(topic)
    case topic.topic_type
    when 'question'
      if topic.resolved?
        fa_icon 'question-circle', title: t('course.forum.topics.topic.question.resolved')
      else
        fa_icon 'question-circle', title: t('course.forum.topics.topic.question.unresolved'),
                                   style: 'color: red'
      end
    when 'sticky'
      fa_icon 'thumb-tack', title: t('course.forum.topics.topic.sticky')
    when 'announcement'
      fa_icon 'bullhorn', title: t('course.forum.topics.topic.announcement')
    end
  end
end
