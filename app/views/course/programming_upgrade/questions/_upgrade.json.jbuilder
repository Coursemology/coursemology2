# frozen_string_literal: true
json.questionId upgrade.question_id
json.workflowState upgrade.workflow_state
json.oldLanguageId upgrade.old_language_id
json.newLanguageId upgrade.new_language_id
json.updatedAt upgrade.updated_at&.iso8601

job = upgrade.job
if job
  json.job do
    json.partial! "jobs/#{job.status}", job: job
  end
end
