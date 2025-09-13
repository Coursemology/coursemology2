# frozen_string_literal: true
json.assessmentId plagiarism_check&.assessment_id
json.workflowState plagiarism_check&.workflow_state || 'not_started'
json.lastRunTime plagiarism_check&.last_started_at&.iso8601
job = plagiarism_check&.job
if job
  json.job do
    json.partial! "jobs/#{job.status}", job: job
  end
end
