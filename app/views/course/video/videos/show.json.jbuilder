# frozen_string_literal: true

json.videoTabs @video_tabs do |video_tab|
  json.id video_tab.id
  json.title video_tab.title
end

json.video do
  json.partial! 'video_data', video: @video
end

json.showPersonalizedTimelineFeatures current_course.show_personalized_timeline_features?
