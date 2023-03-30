# frozen_string_literal: true
json.assessmentTitle @assessment.title
json.assessmentUrl course_assessment_path(current_course, @assessment)
json.studentName @submission.course_user
json.studentUrl link_to_user(@submission.course_user)
json.status @submission.workflow_state
json.editUrl edit_course_assessment_submission_path(current_course, @submission.assessment, @submission)

json.logs @submission.logs.ordered_by_date do |log|
  json.validAttempt log.valid_attempt?
  json.timestamp log.created_at&.iso8601
  json.ipAddress log.ip_address
  json.userAgent log.user_agent
  json.userSessionId log.user_session_id
  json.submissionSessionId log.submission_session_id
end