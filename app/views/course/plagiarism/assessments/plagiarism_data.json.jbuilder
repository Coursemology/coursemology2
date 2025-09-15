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
  base_submission = result[:base_submission]
  compared_submission = result[:compared_submission]

  json.baseSubmission do
    json.id base_submission.id
    course_user = @course_users_hash[base_submission.assessment.course_id][base_submission.creator_id]
    json.courseUser do
      json.(course_user, :id, :name)
      json.path course_user_path(course_user.course, course_user)
    end
    json.assessmentTitle base_submission.assessment.title
    json.courseTitle base_submission.assessment.course.title
    json.submissionUrl edit_course_assessment_submission_path(course_user.course, base_submission.assessment,
                                                              base_submission)
    json.canManage @can_manage_course_hash[base_submission.assessment.course.id]
  end

  json.comparedSubmission do
    json.id compared_submission.id
    course_user = @course_users_hash[compared_submission.assessment.course_id][compared_submission.creator_id]
    json.courseUser do
      json.(course_user, :id, :name)
      json.path course_user_path(course_user.course, course_user)
    end
    json.assessmentTitle compared_submission.assessment.title
    json.courseTitle compared_submission.assessment.course.title
    json.submissionUrl edit_course_assessment_submission_path(course_user.course, compared_submission.assessment,
                                                              compared_submission)
    json.canManage @can_manage_course_hash[compared_submission.assessment.course.id]
  end

  json.similarityScore result[:similarity_score]
  json.submissionPairId result[:submission_pair_id]
end
