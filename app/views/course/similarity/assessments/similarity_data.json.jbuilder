# frozen_string_literal: true
assessment = @assessment
similarity_check = @similarity_check
job = similarity_check.job

json.status do
  json.workflowState similarity_check.workflow_state
  json.lastRunAt similarity_check.last_started_at&.iso8601

  if job
    json.job do
      json.jobId job.id
      json.jobStatus job.status
      json.jobUrl job_path(job) if job.submitted?
      json.errorMessage job.error['message'] if job.error
    end
  end
end

json.submissionPairs @results do |result|
  base_submission = result[:base_submission]
  compared_submission = result[:compared_submission]

  json.baseSubmission do
    json.id base_submission.id
    course_user = @course_users_hash[base_submission.creator_id]
    json.courseUser do
      json.(course_user, :id, :name)
      json.path course_user_path(current_course, course_user)
    end
    json.submissionUrl edit_course_assessment_submission_path(current_course, assessment, base_submission)
  end

  json.comparedSubmission do
    json.id compared_submission.id
    course_user = @course_users_hash[compared_submission.creator_id]
    json.courseUser do
      json.(course_user, :id, :name)
      json.path course_user_path(current_course, course_user)
    end
    json.submissionUrl edit_course_assessment_submission_path(current_course, assessment, compared_submission)
  end

  json.similarityScore result[:similarity_score]
  json.submissionPairId result[:submission_pair_id]
end
