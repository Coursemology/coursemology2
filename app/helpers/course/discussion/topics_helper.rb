# frozen_string_literal: true
module Course::Discussion::TopicsHelper
  # Sanitize the title in settings.
  #
  # @return [String|nil] The formatted title.
  def topics_title
    # We don't want to return a blank string so this check is necessary.
    @settings.title ? format_inline_text(@settings.title) : nil
  end

  # Display code lines in file.
  #
  # @param [Course::Assessment::Answer::ProgrammingFile] file The code file.
  # @param [Integer] line_start The one based start line number.
  # @param [Integer] line_end The one based end line line number.
  # @return [String] A HTML fragment containing the code lines.
  def display_code_lines(file, line_start, line_end)
    code = file.lines((line_start - 1)..(line_end - 1)).join("\n")
    format_code_block(code, file.answer.question.actable.language, [line_start, 1].max)
  end

  # Returns the count of topics pending staff reply.
  #
  # @return [Integer] Returns the count of topics pending staff reply.
  def all_staff_unread_count
    @staff_unread ||= current_course.discussion_topics.
                globally_displayed.pending_staff_reply.distinct.count
  end

  def my_students_unread_count
    @my_students_unread ||=
      if current_course_user
        my_student_ids = current_course_user.my_students.pluck(:user_id)
        topics = current_course.discussion_topics.globally_displayed.pending_staff_reply.distinct.
                 includes(:actable)
        topics.select { |topic| from_user(topic, my_student_ids) }.count
      else
        0
      end
  end

  # TODO: Consider adding `creator_id` column to the programming file annotation table.
  # See https://github.com/Coursemology/coursemology2/issues/2880.
  #
  # This replaces what the `from_user` scopes in the specific models were doing when getting
  # my_students_unread_count, for better performance.
  def from_user(topic, my_student_ids)
    case topic.actable_type
    when 'Course::Assessment::SubmissionQuestion'
      my_student_ids.include?(topic&.actable&.submission&.creator&.id)
    when 'Course::Video::Topic'
      my_student_ids.include?(topic&.actable&.creator&.id)
    when 'Course::Assessment::Answer::ProgrammingFileAnnotation'
      my_student_ids.include?(topic&.actable&.file&.answer&.submission&.creator&.id)
    end
  end

  # Returns the count of unread topics for student course users. Otherwise, return 0.
  #
  # @return [Integer] Returns the count of unread topics
  def all_student_unread_count
    @student_unread ||=
      if current_course_user&.student?
        current_course.discussion_topics.globally_displayed.from_user(current_user.id).
          unread_by(current_user).distinct.count
      else
        0
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

  def link_to_mark_as_read(topic)
    return unless topic.unread?(current_user)
    link_to t('course.discussion.topics.mark_as_read'),
            mark_as_read_course_topic_path(current_course, topic), method: :patch
  end
end
