# frozen_string_literal: true
json.assessment do
  json.partial! 'assessment', assessment: @assessment, course: current_course
end

json.submissions @student_submissions_hash.each do |course_user, (submission, end_at)|
  json.partial! 'course_user', course_user: course_user
  json.partial! 'submission', submission: submission, end_at: end_at
  json.maximumGrade @assessment.maximum_grade
end
