# frozen_string_literal: true
json.questionCount @question_order_hash.size
json.maximumGrade @question_maximum_grade_hash.values.sum
json.submissions @student_submissions_hash.each do |course_user, (submission, answers)|
  json.id course_user.id
  json.name course_user.name
  json.role course_user.role
  json.isPhantom course_user.phantom?

  json.groups course_user.groups do |group|
    json.name group.name
  end

  if !submission.nil? && !answers.nil?
    json.totalGrade submission.grade
    json.workflowState submission.workflow_state

    if submission.workflow_state == 'published'
      # the graders are all the same regardless of question, so we just pick the first one
      grader = @user_id_to_course_user_hash[submission.grader_ids.first]
      json.graderId grader&.id || 0
      json.grader grader&.name || 'System'
    end

    json.answers answers.each do |answer|
      json.id answer.id
      json.grade answer.grade
      json.maximumGrade @question_maximum_grade_hash[answer.question_id]
    end
  end
end
