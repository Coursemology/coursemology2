# frozen_string_literal: true
json.array! @student_live_feedback_hash.each do |course_user, (submission, live_feedback_data)|
  json.partial! 'course_user', course_user: course_user
  if submission.nil?
    json.workflowState 'unstarted'
    json.submissionId nil
  else
    json.workflowState submission.workflow_state
    json.submissionId submission.id
  end

  json.groups @group_names_hash[course_user.id] do |name|
    json.name name
  end

  json.liveFeedbackData live_feedback_data
  json.questionIds(@question_order_hash.keys.sort_by { |key| @question_order_hash[key] })
end
