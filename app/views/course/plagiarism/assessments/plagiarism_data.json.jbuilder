# frozen_string_literal: true
plagiarism_check = @plagiarism_check
job = plagiarism_check.job

json.status do
  json.workflowState plagiarism_check.workflow_state
  json.lastRunAt plagiarism_check.last_started_at&.iso8601

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
  base_submission = @submissions_hash[result[:base_submission_id]]
  compared_submission = @submissions_hash[result[:compared_submission_id]]

  next if base_submission.nil? || compared_submission.nil?

  json.baseSubmission do
    json.id base_submission.id
    json.courseUser do
      json.id base_submission.creator_course_user_id
      json.name base_submission.creator_course_user_name
      json.path course_user_path(base_submission.course_id, base_submission.creator_course_user_id)
      json.userId base_submission.creator_id
    end
    json.assessmentTitle base_submission.assessment_title
    json.courseTitle base_submission.course_title
    json.submissionUrl edit_course_assessment_submission_path(
      base_submission.course_id,
      base_submission.assessment_id,
      base_submission.id
    )
    json.canManage @can_manage_submissions_hash[base_submission.id]
  end

  json.comparedSubmission do
    json.id compared_submission.id
    json.courseUser do
      json.id compared_submission.creator_course_user_id
      json.name compared_submission.creator_course_user_name
      json.path course_user_path(compared_submission.course_id, compared_submission.creator_course_user_id)
      json.userId compared_submission.creator_id
    end
    json.assessmentTitle compared_submission.assessment_title
    json.courseTitle compared_submission.course_title
    json.submissionUrl edit_course_assessment_submission_path(
      compared_submission.course_id,
      compared_submission.assessment_id,
      compared_submission.id
    )
    json.canManage @can_manage_submissions_hash[compared_submission.id]
  end

  json.similarityScore result[:similarity_score]
  json.submissionPairId result[:submission_pair_id]
end
