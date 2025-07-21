# frozen_string_literal: true
json.assessments @assessments do |assessment|
  num_submitted = @num_submitted_students_hash[assessment.id] || 0

  json.id assessment.id
  json.title assessment.title
  json.url course_assessment_path(current_course, assessment)
  json.plagiarismUrl plagiarism_course_assessment_path(current_course, assessment)
  json.submissionsUrl course_assessment_submissions_path(current_course, assessment)

  json.numCheckableQuestions assessment.num_plagiarism_checkable_questions
  json.numSubmitted num_submitted
  json.lastSubmittedAt @latest_submission_time_hash[assessment.id]&.iso8601

  json.workflowState assessment.plagiarism_check&.workflow_state || 'not_started'
  json.lastRunTime assessment.plagiarism_check&.last_started_at&.iso8601

  job = assessment.plagiarism_check&.job
  json.errorMessage job.error['message'] if job&.error
end
