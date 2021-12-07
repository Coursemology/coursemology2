# frozen_string_literal: true
submissions_hash ||= @submissions.map { |s| [s.course_user_id, s] }.to_h

json.assessment do
  json.title @assessment.title
  json.maximumGrade @assessment.maximum_grade.to_f
  json.autograded @assessment.autograded
  json.gamified current_course.gamified?
  json.downloadable @assessment.downloadable?
  json.passwordProtected @assessment.session_password_protected?
  json.canViewLogs can? :manage, @assessment
  json.canPublishGrades can? :publish_grades, @assessment
  json.canForceSubmit can? :force_submit_assessment_submission, @assessment
  json.canUnsubmitSubmission can? :update, @assessment
  json.canDeleteAllSubmissions can? :delete_all_submissions, @assessment
end

my_students_set = Set.new(@my_students.map(&:id))

json.submissions @course_users do |course_user|
  json.courseUser do
    json.(course_user, :id, :name)
    json.path course_user_path(current_course, course_user)
    json.phantom course_user.phantom?
    json.myStudent my_students_set.include?(course_user.id) if course_user.student?
    json.isStudent course_user.student?
    json.isCurrentUser course_user.user == current_user
  end

  submission = submissions_hash[course_user.id]
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
