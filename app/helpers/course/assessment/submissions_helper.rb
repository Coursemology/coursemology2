# frozen_string_literal: true
module Course::Assessment::SubmissionsHelper
  # Returns the count of student submissions in a course that are pending grading.
  #
  # @return [Integer] The required count
  def pending_submissions_count
    @pending_submissions_count ||= begin
      student_ids = current_course.course_users.students.select(:user_id)
      pending_submission_count_for(student_ids)
    end
  end

  # Returns the count of submissions of my students in a course that are pending grading
  #
  # @return [Integer] The required count
  def my_students_pending_submissions_count
    @my_student_pending_submissions ||= begin
      my_student_ids = current_course_user ? current_course_user.my_students.select(:user_id) : []
      pending_submission_count_for(my_student_ids)
    end
  end

  private

  # Returns the count of submissions given the student ids
  #
  # @param [Array<Integer>] student_ids The submissions for the given user_ids of student
  # @return [Integer] The required count
  def pending_submission_count_for(student_ids)
    return 0 if student_ids.blank?

    Course::Assessment::Submission.
      from_course(current_course).by_users(student_ids).pending_for_grading.count
  end
end
