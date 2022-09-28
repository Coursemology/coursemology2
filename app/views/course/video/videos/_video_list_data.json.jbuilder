# frozen_string_literal: true
video_item = @video_items_hash ? @video_items_hash[video.id] : video
can_attempt = can?(:attempt, video)
can_manage = can?(:manage, video)

json.id video.id
json.tabId video.tab_id
json.title video.title
json.description format_ckeditor_rich_text(video.description)
json.url video.url
json.published video.published
json.hasPersonalTimes video.has_personal_times?
json.affectsPersonalTimes video_item.affects_personal_times?

json.startTimeInfo do
  json.partial! 'course/lesson_plan/items/personal_or_ref_time',
                item: video_item,
                course_user: current_course_user,
                attribute: :start_at,
                datetime_format: :long
end

json.videoSubmissionId video.submissions.first&.id

json.videoChildrenExist video.children_exist? if can_manage

if can_analyze
  json.watchCount @video_submission_count_hash ? @video_submission_count_hash[video.id] : video.student_submission_count
  json.percentWatched video.statistic&.percent_watched
end

json.permissions do
  json.canAttempt can_attempt && current_course_user
  json.canManage can_manage
end
