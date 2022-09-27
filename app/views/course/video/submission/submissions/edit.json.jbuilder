# frozen_string_literal: true

json.id @submission.id
json.videoTabId @video.tab_id
json.videoTitle @video.title
json.videoDescription @video.description

json.videoData do
  json.partial! @video, locals: { seek_time: @seek_time }

  json.discussion do
    json.partial! 'course/video/topics/topics', locals: { topics: @topics }
    json.partial! 'course/video/topics/posts', locals: { posts: @posts }
    json.scrolling do
      json.scrollTopicId @scroll_topic_id
    end
  end

  json.courseUserId current_course_user&.id&.to_s
  json.enableMonitoring @enable_monitoring || false
end
