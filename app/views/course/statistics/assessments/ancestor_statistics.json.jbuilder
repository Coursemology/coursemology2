# frozen_string_literal: true
json.assessment do
  json.id @assessment.id
  json.title @assessment.title
  json.startAt @assessment.start_at&.iso8601
  json.endAt @assessment.end_at&.iso8601
  json.maximumGrade @assessment.maximum_grade
  json.url course_assessment_path(current_course, @assessment)
end

json.submissions @student_submissions_hash.each do |course_user, (submission, end_at)|
  json.courseUser do
    json.id course_user.id
    json.name course_user.name
    json.role course_user.role
    json.isPhantom course_user.phantom?
  end

  json.workflowState submission.workflow_state
  json.submittedAt submission.submitted_at&.iso8601
  json.endAt end_at&.iso8601
  json.totalGrade submission.grade
end

json.allStudents @all_students.each do |student|
  json.id student.id
  json.name student.name
  json.role student.role
  json.isPhantom student.phantom?
end
