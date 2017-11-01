json.video do
  json.videoUrl @video.url
end

json.discussion do
  json.partial! 'course/video/topics/topics', locals: { topics: @topics }
  json.partial! 'course/video/topics/posts', locals: { posts: @posts }
  json.scrolling do
    json.scrollTopicId @scroll_topic_id
  end
end
