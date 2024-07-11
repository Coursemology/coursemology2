# frozen_string_literal: true

json.videoTitle @settings.title || ''

json.videoTabs @video_tabs do |video_tab|
  json.id video_tab.id
  json.title video_tab.title
end

json.videos @videos do |video|
  json.partial! 'video_list_data', video: video, can_analyze: @can_analyze, submission: video.submissions.first&.id
end

json.metadata do
  json.currentTabId @tab.id
  json.studentsCount @course_students.count
  json.isCurrentCourseUser current_course_user.present?
  json.isStudent current_course_user&.student?
  json.timelineAlgorithm current_course_user&.timeline_algorithm
  json.showPersonalizedTimelineFeatures current_course.show_personalized_timeline_features
end

json.permissions do
  json.canAnalyze @can_analyze
  json.canManage @can_manage
end
