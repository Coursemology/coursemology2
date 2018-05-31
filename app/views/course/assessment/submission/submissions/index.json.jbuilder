# frozen_string_literal: true
submissions_hash ||= @submissions.map { |s| [s.course_user_id, s] }.to_h

json.assessment do
  json.title @assessment.title
  json.maximumGrade @assessment.maximum_grade.to_f
  json.gamified current_course.gamified?
  json.downloadable @assessment.downloadable?
  json.passwordProtected @assessment.session_password_protected?
  json.canViewLogs can? :manage, @assessment
end

my_students_set = Set.new(@my_students.map(&:id))

json.submissions @course_students do |course_student|
  json.courseStudent do
    json.(course_student, :id, :name)
    json.path course_user_path(current_course, course_student)
    json.phantom course_student.phantom?
    json.myStudent my_students_set.include?(course_student.id)
  end

  submission = submissions_hash[course_student.id]
  if submission
    json.id submission.id
    json.workflowState submission.workflow_state
    json.grade submission.grade.to_f
    json.pointsAwarded submission.current_points_awarded
    json.dateSubmitted submission.submitted_at
    json.dateGraded submission.graded_at
    json.logCount submission.log_count
  else
    json.workflowState 'unstarted'
  end
end
