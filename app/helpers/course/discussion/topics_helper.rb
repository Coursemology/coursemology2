# frozen_string_literal: true
module Course::Discussion::TopicsHelper
  include Course::Discussion::CodeDisplayHelper

  # Sanitize the title in settings.
  #
  # @return [String|nil] The formatted title.
  def topics_title
    # We don't want to return a blank string so this check is necessary.
    @settings.title ? format_inline_text(@settings.title) : nil
  end

  def all_unread_count
    @unread ||= current_course.discussion_topics.
                globally_displayed.pending_staff_reply.distinct.count
  end

  def my_students_unread_count
    @my_students_unread ||= begin
        my_student_ids = current_course_user.my_students.select(:user_id)
        current_course.discussion_topics.globally_displayed.
          from_user(my_student_ids).pending_staff_reply.distinct.count
      end
  end

  def link_to_toggle_pending(topic)
    if topic.pending_staff_reply?
      link_to t('course.discussion.topics.unmark_as_pending'),
              toggle_pending_course_topic_path(current_course, topic, pending: false),
              method: :patch, remote: true
    else
      link_to t('course.discussion.topics.mark_as_pending'),
              toggle_pending_course_topic_path(current_course, topic, pending: true),
              method: :patch, remote: true
    end
  end
end
