# frozen_string_literal: true
module Course::Assessment::Submission::SubmissionsWorkflowStateHelper
  # Returns a hash of course_user to submission for searching by course_user
  #
  # @return [Hash]
  def submissions_hash
    @submissions_hash ||= @submissions.map { |s| [s.course_user, s] }.to_h
  end

  # Whether there are any confirmed submissions from a group of students
  #
  # @param [Array<CourseUser>] course_users The course_users to check
  # @return [Boolean] Whether there are any submissions
  def any_confirmed_submissions_by?(course_users)
    course_users.map { |u| submissions_hash[u] }.any? { |s| s && s.workflow_state != 'attempting' }
  end

  # Returns the list of possible submission states in order
  # Note: :not_started is not a true workflow state, but the absence of a submission object.
  #
  # @return [Array<Symbol>] The possible submission states
  def submission_state_names
    Course::Assessment::Submission.workflow_spec.state_names.unshift(:not_started).map(&:to_s)
  end

  # Returns the count of submissions in each submission state among a group of students.
  #
  # @param [Array<CourseUser>] course_users The course_users to count submissions for
  # @return [Hash] Hash containing counts for each submission state
  def submission_state_counts(course_users)
    course_users.each_with_object(Hash.new(0)) do |course_user, hash|
      submission = submissions_hash[course_user]
      workflow_state = submission ? submission.workflow_state : 'not_started'
      hash[workflow_state] += 1
    end
  end
end
