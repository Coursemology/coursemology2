# frozen_string_literal: true
module Course::Discussion::TopicsHelper
  # Display code lines in file.
  #
  # @param [Course::Assessment::Answer::ProgrammingFile] file The code file.
  # @param [Integer] line_start The one based start line number.
  # @param [Integer] line_end The one based end line line number.
  # @return [String] A HTML fragment containing the code lines.
  def display_code_lines(file, line_start, line_end)
    # If line_start is somehow greater than the number of lines in the file,
    # display a blank code line as a placeholder
    code = (file.lines((line_start - 1)..(line_end - 1)) || ['']).join("\n")

    format_code_block(code, file.answer.question.actable.language, [line_start, 1].max)
  end

  # Whether the course shows AI-generated comments in the staff pending counts/lists (set in the comments
  # settings admin page). Defaults to true, preserving the existing behaviour of surfacing them.
  #
  # @return [Boolean]
  def showing_ai_generated_comments?
    value = current_course.settings(Course::Discussion::TopicsComponent.key).is_showing_ai_generated_comments
    value.nil? || value
  end

  # Applies the "hide AI-generated comments" filter to a pending-topics relation, dropping topics whose
  # latest post is an unreviewed AI draft, unless the course shows AI-generated comments.
  #
  # @param [ActiveRecord::Relation] topics A relation of pending topics.
  # @return [ActiveRecord::Relation]
  def hide_ai_generated_comments(topics)
    showing_ai_generated_comments? ? topics : topics.without_ai_draft_latest_post
  end

  # Returns the count of topics pending staff reply.
  #
  # @return [Integer] Returns the count of topics pending staff reply.
  def all_staff_unread_count
    @all_staff_unread_count ||= hide_ai_generated_comments(
      current_course.discussion_topics.globally_displayed.pending_staff_reply
    ).distinct.count
  end

  def my_students_unread_count
    @my_students_unread_count ||=
      if current_course_user
        my_student_ids = current_course_user.my_students.pluck(:user_id)
        topics = hide_ai_generated_comments(
          current_course.discussion_topics.globally_displayed.pending_staff_reply
        ).distinct.includes(actable: [:submission, file: { answer: :submission }])
        topics.select { |topic| from_user(topic, my_student_ids) }.count
      else
        0
      end
  end

  # This replaces what the `from_user` scopes in the specific models were doing when getting
  # my_students_unread_count, for better performance.
  def from_user(topic, my_student_ids) # rubocop:disable Metrics/PerceivedComplexity, Metrics/CyclomaticComplexity
    case topic.actable_type
    when 'Course::Assessment::SubmissionQuestion'
      my_student_ids.include?(topic&.actable&.submission&.creator_id)
    when 'Course::Video::Topic'
      my_student_ids.include?(topic&.actable&.creator_id)
    when 'Course::Assessment::Answer::ProgrammingFileAnnotation'
      my_student_ids.include?(topic&.actable&.file&.answer&.submission&.creator_id)
    end
  end

  # Returns the count of unread topics for student course users. Otherwise, return 0.
  #
  # @return [Integer] Returns the count of unread topics
  def all_student_unread_count
    @all_student_unread_count ||=
      if current_course_user&.student?
        current_course.discussion_topics.globally_displayed.from_user(current_user.id).
          unread_by(current_user).distinct.with_published_posts.count
      else
        0
      end
  end
end
