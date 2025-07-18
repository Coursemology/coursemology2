# frozen_string_literal: true
can_attempt = can?(:attempt, assessment)
can_view_submissions = can?(:view_all_submissions, assessment)
can_manage = can?(:manage, assessment)

can_read_statistics = can?(:read_statistics, current_course) &&
                      current_component_host[:course_statistics_component].present?

can_manage_similarity = can?(:manage_similarity, current_course) &&
                        current_component_host[:course_similarity_component].present?

can_read_monitor = can?(:read, Course::Monitoring::Monitor.new) && @monitor.present?

attempting_submission = submissions.find(&:attempting?)
submitted_submission = submissions.find { |submission| !submission.attempting? }

is_course_koditsu_enabled = current_course.component_enabled?(Course::KoditsuPlatformComponent)
is_assessment_koditsu_enabled = assessment.koditsu_assessment_id && assessment.is_koditsu_enabled

action_url = nil
if !current_course_user || !can_attempt
  status = 'unavailable'
elsif cannot?(:access, assessment) && can_attempt
  status = 'locked'
  action_url = course_assessment_path(current_course, assessment)
elsif attempting_submission.present?
  status = 'attempting'
  action_url = if is_course_koditsu_enabled && is_assessment_koditsu_enabled
                 KoditsuAsyncApiService.assessment_url(assessment.koditsu_assessment_id)
               else
                 edit_course_assessment_submission_path(current_course, assessment, attempting_submission)
               end
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
json.similarityUrl similarity_course_assessment_path(current_course, assessment) if can_manage_similarity
json.monitoringUrl monitoring_course_assessment_path(current_course, assessment) if can_read_monitor
json.submissionsUrl course_assessment_submissions_path(current_course, assessment) if can_view_submissions
json.editUrl edit_course_assessment_path(current_course, assessment) if can_manage
json.deleteUrl course_assessment_path(current_course, assessment) if can_manage
