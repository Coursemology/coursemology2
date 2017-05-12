json.progress do
  # Show submission as submitted to students if grading is not published yet
  apparent_workflow_state = cannot?(:grade, submission) && submission.graded? ?
    'submitted' : submission.workflow_state

  json.workflow_state apparent_workflow_state
  json.submitter display_course_user(submission.course_user)

  json.due_at submission.assessment.end_at
  json.attempted_at submission.created_at
  json.submitted_at submission.submitted_at
  if ['graded', 'published'].include? apparent_workflow_state
    # Display the published time first, else show the graded time if available.
    # For showing timestamps from delayed grade publication.
    json.graded_at submission.published_at || submission.graded_at
    json.grader display_user(submission.publisher)
    json.grade submission.grade.to_f
    json.maximum_grade submission.assessment.maximum_grade.to_f
  end

  json.late submission.assessment.end_at && submission.submitted_at &&
    submission.submitted_at > submission.assessment.end_at

  if current_course.gamified?
    json.base_points submission.assessment.base_exp
    json.points_awarded submission.points_awarded
  end
end
