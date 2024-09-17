# frozen_string_literal: true
can_attempt = can?(:attempt, assessment)
can_view_submissions = can?(:view_all_submissions, assessment)
can_manage = can?(:manage, assessment)

can_read_statistics = can?(:read_statistics, current_course) &&
                      current_component_host[:course_statistics_component].present?

can_read_monitor = can?(:read, Course::Monitoring::Monitor.new) && @monitor.present?

attempting_submission = submissions.find(&:attempting?)
submitted_submission = submissions.find { |submission| !submission.attempting? }

action_url = nil
if !current_course_user || !can_attempt
  status = 'unavailable'
elsif cannot?(:access, assessment) && can_attempt
  status = 'locked'
  action_url = course_assessment_path(current_course, assessment)
elsif attempting_submission.present?
  status = 'attempting'
  action_url = edit_course_assessment_submission_path(current_course, assessment, attempting_submission)
elsif submitted_submission.present?
  status = 'submitted'
  action_url = edit_course_assessment_submission_path(current_course, assessment, submitted_submission)
else
  status = 'open'
  action_url = course_assessment_attempt_path(current_course, assessment)
end

json.status status
json.actionButtonUrl action_url

json.statisticsUrl statistics_course_assessment_path(current_course, assessment) if can_read_statistics
json.monitoringUrl monitoring_course_assessment_path(current_course, assessment) if can_read_monitor
json.submissionsUrl course_assessment_submissions_path(current_course, assessment) if can_view_submissions
json.editUrl edit_course_assessment_path(current_course, assessment) if can_manage
json.deleteUrl course_assessment_path(current_course, assessment) if can_manage
