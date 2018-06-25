# frozen_string_literal: true
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
