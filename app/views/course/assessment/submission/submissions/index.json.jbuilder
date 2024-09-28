# frozen_string_literal: true
submissions_hash ||= @submissions.to_h { |s| [s.creator_id, s] }
course_users_hash ||= @course_users.to_h { |cu| [cu.user_id, [cu.id, cu.name]] }
course_users_hash[0] = [0, 'System']

json.assessment do
  json.title @assessment.title
  json.maximumGrade @assessment.maximum_grade.to_f
  json.autograded @assessment.autograded
  json.gamified current_course.gamified?
  json.filesDownloadable @assessment.files_downloadable?
  json.csvDownloadable @assessment.csv_downloadable?
  json.passwordProtected @assessment.session_password_protected?
  json.canViewLogs can? :manage, @assessment
  json.canPublishGrades can? :publish_grades, @assessment
  json.canForceSubmit can? :force_submit_assessment_submission, @assessment
  json.canUnsubmitSubmission can? :update, @assessment
  json.canDeleteAllSubmissions can? :delete_all_submissions, @assessment
  json.isKoditsuEnabled current_course.component_enabled?(Course::KoditsuPlatformComponent) &&
                        @assessment.is_koditsu_enabled && @assessment.koditsu_assessment_id
end

my_students_set = Set.new(@my_students.map(&:id))

json.submissions @course_users do |course_user|
  json.courseUser do
    json.(course_user, :id, :name)
    json.path course_user_path(current_course, course_user)
    json.phantom course_user.phantom?
    json.myStudent my_students_set.include?(course_user.id) if course_user.student?
    json.isStudent course_user.student?
    json.isCurrentUser course_user == @current_course_user
  end

  submission = submissions_hash[course_user.user_id]
  if submission
    json.id submission.id
    json.workflowState submission.workflow_state
    json.grade submission.grade.to_f
    json.pointsAwarded submission.current_points_awarded
    json.dateSubmitted submission.submitted_at&.iso8601
    json.dateGraded submission.graded_at&.iso8601
    json.logCount submission.log_count
    json.graders do
      json.array! submission.grader_ids do |grader_id|
        cu = course_users_hash[grader_id] || [0, 'Unknown']
        json.id cu[0]
        json.name cu[1]
      end
    end
  else
    json.workflowState 'unstarted'
  end
end
