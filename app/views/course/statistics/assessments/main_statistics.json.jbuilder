# frozen_string_literal: true
json.assessment do
  json.partial! 'assessment', assessment: @assessment, course: current_course
  json.isAutograded @assessment_autograded
  json.questionCount @assessment.question_count
  json.isLiveFeedbackEnabled @assessment.live_feedback_enabled
end

json.submissions @student_submissions_hash.each do |course_user, (submission, answers, end_at)|
  json.partial! 'course_user', course_user: course_user
  json.partial! 'submission', submission: submission, end_at: end_at

  json.groups @group_names_hash[course_user.id] do |name|
    json.name name
  end

  if !submission.nil? && submission.workflow_state == 'published' && submission.grader_ids
    # the graders are all the same regardless of question, so we just pick the first one
    json.partial! 'answer', grader: @course_users_hash[submission.grader_ids.first], answers: answers
    json.partial! 'attempt_status', answers: answers
  end
end

json.ancestors @ancestors do |ancestor|
  json.id ancestor.id
  json.title ancestor.title
  json.courseTitle ancestor.course&.title
end
