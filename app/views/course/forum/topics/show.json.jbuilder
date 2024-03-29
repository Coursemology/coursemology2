# frozen_string_literal: true

json.topic do
  json.partial! 'course/forum/topics/topic_list_data', forum: @topic.forum, topic: @topic
end

json.postTreeIds @posts.sorted_ids
json.nextUnreadTopicUrl next_unread_topic_link(@topic.forum)

json.posts @posts.flatten do |post|
  json.partial! 'course/forum/posts/post_list_data', forum: @topic.forum, topic: @topic, post: post
end
