json.submission do
  json.canGrade can_grade
  json.canUpdate can_update
  json.isCreator current_user == submission.creator

  if assessment.autograded?
    question = assessment.questions.next_unanswered(submission)
    if question && !can_grade
      json.maxStep assessment.questions.index(question)
    else
      json.maxStep assessment.questions.length - 1
    end
  end

  # Show submission as submitted to students if grading is not published yet
  apparent_workflow_state = cannot?(:grade, submission) && submission.graded? ?
    'submitted' : submission.workflow_state

  json.workflowState apparent_workflow_state
  json.submitter display_course_user(submission.course_user)

  json.dueAt assessment.end_at
  json.attemptedAt submission.created_at
  json.submittedAt submission.submitted_at
  if ['graded', 'published'].include? apparent_workflow_state
    # Display the published time first, else show the graded time if available.
    # For showing timestamps from delayed grade publication.
    json.gradedAt submission.published_at || submission.graded_at
    json.grader display_user(submission.publisher) if apparent_workflow_state == 'published'
    json.grade submission.grade.to_f
  end
  json.maximumGrade assessment.maximum_grade.to_f

  json.late assessment.end_at && submission.submitted_at &&
    submission.submitted_at > assessment.end_at

  if current_course.gamified?
    json.basePoints assessment.base_exp
    json.pointsAwarded submission.current_points_awarded
  end
end
