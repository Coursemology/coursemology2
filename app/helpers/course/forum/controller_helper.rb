# frozen_string_literal: true
module Course::Forum::ControllerHelper
  def link_to_next_unread
    link_to t('course.forum.forums.next_unread.title'),
            next_unread_course_forums_path(current_course),
            title: t('course.forum.forums.next_unread.description'),
            class: ['btn', 'btn-default']
  end
end
