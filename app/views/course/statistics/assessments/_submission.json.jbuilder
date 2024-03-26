# frozen_string_literal: true
if submission.nil?
  json.workflowState 'unstarted'
else
  json.workflowState submission.workflow_state
  json.submittedAt submission.submitted_at&.iso8601
  json.endAt end_at&.iso8601
  json.totalGrade submission.grade
end
