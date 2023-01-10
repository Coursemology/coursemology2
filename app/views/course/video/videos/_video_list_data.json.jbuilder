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
json.hasPersonalTimes current_course.show_personalized_timeline_features && video.has_personal_times?
json.hasTodo video.has_todo if can_manage
json.affectsPersonalTimes current_course.show_personalized_timeline_features && video_item.affects_personal_times?

json.startTimeInfo do
  json.partial! 'course/lesson_plan/items/personal_or_ref_time',
                item: video_item,
                course_user: current_course_user,
                attribute: :start_at,
                datetime_format: :long
end

json.videoSubmissionId submission if can_attempt && current_course_user.present?

json.videoChildrenExist video.children_exist? if can_manage

if can_analyze
  json.watchCount @video_submission_count_hash ? @video_submission_count_hash[video.id] : video.student_submission_count
  json.percentWatched video.statistic&.percent_watched
end

json.permissions do
  json.canAttempt can_attempt && current_course_user.present?
  json.canManage can_manage
end
