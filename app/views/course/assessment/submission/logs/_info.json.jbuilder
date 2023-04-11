# frozen_string_literal: true
json.info do
  json.assessmentTitle assessment.title
  json.assessmentUrl course_assessment_path(course, assessment)
  json.studentName submission.course_user.name
  json.studentUrl url_to_user_or_course_user(course, submission.course_user)
  json.submissionWorkflowState submission.workflow_state
  json.editUrl edit_course_assessment_submission_path(course, submission.assessment, submission)
end
