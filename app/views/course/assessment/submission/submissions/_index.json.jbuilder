submissions_hash ||= @submissions.map { |s| [s.course_user_id, s] }.to_h

json.gamified current_course.gamified?

json.assessment do
  json.title format_inline_text(@assessment.title)
  json.maximumGrade @assessment.maximum_grade
end
json.submissions @course_students do |course_student|
  json.courseStudent do
    json.(course_student, :id, :name)
    json.path course_user_path(current_course, course_student)
    json.phantom course_student.phantom?
  end

  submission = submissions_hash[course_student.id]
  if submission
    json.id submission.id
    json.workflowState submission.workflow_state
    json.grade submission.grade
    json.pointsAwarded submission.current_points_awarded
  else
    json.workflowState 'unstarted'
  end
end
