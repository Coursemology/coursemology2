# frozen_string_literal: true
module Course::UnreadCountsConcern
  extend ActiveSupport::Concern

  private

  def unread_announcements_count
    return 0 unless current_user&.present?

    current_course.announcements.accessible_by(current_ability).unread_by(current_user).count
  end

  def unread_forum_topics_count
    return 0 unless current_user&.present?

    Course::Forum::Topic.from_course(current_course).accessible_by(current_ability).unread_by(current_user).count
  end

  def unwatched_videos_count
    return 0 unless current_course_user&.student?

    Course::Video.from_course(current_course).unwatched_by(current_user).published.active.count
  end

  def pending_enrol_requests_count
    return 0 unless can?(:manage_users, current_course)

    current_course.enrol_requests.pending.count
  end

  # Returns the number of pending submissions based on the `CourseUser` role.
  # - `:teacher_assistant`: submissions from students in my group,
  # - `:owner`, `:manager`: submissions from students in my group if it's not `0`, otherwise, from all students,
  # - `:student` or other users: `0`.
  def pending_assessment_submissions_count
    self.class.include Course::Assessment::SubmissionsHelper

    if current_course_user&.manager_or_owner?
      (my_students_pending_submissions_count > 0) ? my_students_pending_submissions_count : pending_submissions_count
    elsif current_course_user&.staff?
      my_students_pending_submissions_count
    else
      0
    end
  end

  def unread_comments_count # rubocop:disable Metrics/PerceivedComplexity, Metrics/CyclomaticComplexity
    self.class.include Course::Discussion::TopicsHelper

    is_staff_with_students = current_course_user&.staff? && !current_course_user.my_students.empty?

    if is_staff_with_students
      my_students_unread_count
    elsif current_course_user&.teaching_staff?
      all_staff_unread_count
    elsif current_course_user&.student?
      all_student_unread_count
    else
      0
    end
  end
end
