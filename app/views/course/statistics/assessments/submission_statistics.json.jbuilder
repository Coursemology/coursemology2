# frozen_string_literal: true
json.array! @student_submissions_hash.each do |course_user, (submission, answers, end_at)|
  json.partial! 'course_user', course_user: course_user
  json.partial! 'submission', submission: submission, end_at: end_at

  json.maximumGrade @assessment.maximum_grade
  json.groups @group_names_hash[course_user.id] do |name|
    json.name name
  end

  if !submission.nil? && (submission.graded? || submission.published?) && submission.grader_ids
    # the graders are all the same regardless of question, so we just pick the first one
    json.partial! 'answer', grader: @course_users_hash[submission.grader_ids.first], answers: answers
  end
  json.partial! 'attempt_status', answers: answers unless submission.nil?
end
