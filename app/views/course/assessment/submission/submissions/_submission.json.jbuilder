# frozen_string_literal: true
json.submission do
  json.id submission.id
  json.canGrade can_grade
  json.canUpdate can_update
  json.isCreator current_user.id == submission.creator_id

  if assessment.autograded? && !assessment.skippable?
    question = submission.questions.next_unanswered(submission)
    # If question does not exist, means the student have answered all questions
    json.maxStep submission.questions.index(question) if question
  end

  # Show submission as submitted to students if grading is not published yet
  apparent_workflow_state = if cannot?(:grade, submission) && submission.graded?
                              'submitted'
                            else
                              submission.workflow_state
                            end

  json.workflowState apparent_workflow_state
  json.submitter do
    json.name display_course_user(submission.course_user)
    json.id submission.course_user.id
  end

  json.timerStartedAt submission.timer_started_at if assessment.time_limit

  submitter_course_user = submission.creator.course_users.find_by(course: submission.assessment.course)
  end_at = assessment.time_for(submitter_course_user).end_at
  bonus_end_at = assessment.time_for(submitter_course_user).bonus_end_at
  json.bonusEndAt bonus_end_at&.iso8601
  json.dueAt end_at&.iso8601
  json.attemptedAt submission.created_at&.iso8601
  json.submittedAt submission.submitted_at&.iso8601
  if ['graded', 'published'].include? apparent_workflow_state
    # Display the published time first, else show the graded time if available.
    # For showing timestamps from delayed grade publication.
    json.gradedAt submission.published_at&.iso8601 || submission.graded_at&.iso8601
    if apparent_workflow_state == 'published'
      json.grader do
        json.name display_user(submission.publisher)
        publisher = CourseUser.find_by(course: current_course, user: submission.publisher)
        json.id publisher.id if publisher
      end
    end
    json.grade submission.grade.to_f
  end
  json.maximumGrade submission.questions.sum(:maximum_grade).to_f

  json.showPublicTestCasesOutput current_course.show_public_test_cases_output
  json.showStdoutAndStderr current_course.show_stdout_and_stderr

  json.late end_at && submission.submitted_at &&
            submission.submitted_at.iso8601 > end_at

  json.basePoints assessment.base_exp
  json.bonusPoints assessment.time_bonus_exp
  json.pointsAwarded submission.current_points_awarded
end
