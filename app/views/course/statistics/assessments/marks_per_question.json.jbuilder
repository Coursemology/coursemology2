# frozen_string_literal: true
json.questionCount @question_order_hash.size
json.maximumGrade @question_maximum_grade_hash.values.sum
json.assessmentTitle @assessment.title
json.submissions @student_submissions_hash.each do |course_user, (submission, answers)|
  json.courseUser do
    json.id course_user.id
    json.name course_user.name
    json.role course_user.role
    json.isPhantom course_user.phantom?
  end

  json.groups course_user.groups do |group|
    json.name group.name
  end

  if !submission.nil? && !answers.nil?
    json.totalGrade submission.grade
    json.workflowState submission.workflow_state

    if submission.workflow_state == 'published' && submission.grader_ids
      # the graders are all the same regardless of question, so we just pick the first one
      grader = @course_users_hash[submission.grader_ids.first]
      json.grader do
        json.id grader&.id || 0
        json.name grader&.name || 'System'
      end

      json.answers answers.each do |answer|
        json.id answer.id
        json.grade answer.grade
        json.maximumGrade @question_maximum_grade_hash[answer.question_id]
      end
    end
  end
end
