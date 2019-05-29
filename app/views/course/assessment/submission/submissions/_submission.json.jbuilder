# frozen_string_literal: true
json.submission do
  json.id submission.id
  json.canGrade can_grade
  json.canUpdate can_update
  json.isCreator current_user == submission.creator

  if assessment.autograded? && !assessment.skippable?
    question = submission.questions.next_unanswered(submission)
    # If question does not exist, means the student have answered all questions
    json.maxStep submission.questions.index(question) if question
  end

  # Show submission as submitted to students if grading is not published yet
  apparent_workflow_state = cannot?(:grade, submission) && submission.graded? ?
    'submitted' : submission.workflow_state

  json.workflowState apparent_workflow_state
  json.submitter display_course_user(submission.course_user)

  submitter_course_user = submission.creator.course_users.find_by(course: submission.assessment.course)
  end_at = assessment.time_for(submitter_course_user).end_at
  bonus_end_at = assessment.time_for(submitter_course_user).bonus_end_at
  json.bonusEndAt bonus_end_at
  json.dueAt end_at
  json.attemptedAt submission.created_at
  json.submittedAt submission.submitted_at
  if ['graded', 'published'].include? apparent_workflow_state
    # Display the published time first, else show the graded time if available.
    # For showing timestamps from delayed grade publication.
    json.gradedAt submission.published_at || submission.graded_at
    json.grader display_user(submission.publisher) if apparent_workflow_state == 'published'
    json.grade submission.grade.to_f
  end
  json.maximumGrade submission.questions.sum(:maximum_grade).to_f

  json.showPublicTestCasesOutput current_course.show_public_test_cases_output
  json.showStdoutAndStderr current_course.show_stdout_and_stderr

  json.late end_at && submission.submitted_at &&
    submission.submitted_at > end_at

  json.basePoints assessment.base_exp
  json.bonusPoints assessment.time_bonus_exp
  json.pointsAwarded submission.current_points_awarded
end
