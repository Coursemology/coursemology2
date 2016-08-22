# frozen_string_literal: true
module Course::Assessment::SubmissionsHelper
  # Returns the count of submissions in a course that are pending grading
  #
  # @return [Fixnum] The required count
  def pending_submissions_count
    @pending_submissions_count ||=
      Course::Assessment::Submission.from_course(current_course).with_submitted_state.count
  end

  # Returns the count of submissions of my students in a course that are pending grading
  #
  # @return [Fixnum] The required count
  def my_students_pending_submissions_count
    @my_student_pending_submissions ||= begin
      my_student_ids = current_course_user ? current_course_user.my_students.select(:user_id) : []
      Course::Assessment::Submission.from_course(current_course).with_submitted_state.
        by_users(my_student_ids).count
    end
  end
end
