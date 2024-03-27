# frozen_string_literal: true
json.assessment do
  json.partial! 'assessment', assessment: @assessment, course: current_course
  json.questionCount @assessment.question_count
end

json.submissions @student_submissions_hash.each do |course_user, (submission, answers, end_at)|
  json.partial! 'course_user', course_user: course_user
  json.partial! 'submission', submission: submission, end_at: end_at

  json.groups course_user.groups do |group|
    json.name group.name
  end

  if !submission.nil? && submission.workflow_state == 'published' && submission.grader_ids
    # the graders are all the same regardless of question, so we just pick the first one
    json.partial! 'answer', grader: @course_users_hash[submission.grader_ids.first], answers: answers
  end
end

json.ancestors @ancestors do |ancestor|
  json.id ancestor.id
  json.title ancestor.title
  json.courseTitle ancestor.course&.title
end
