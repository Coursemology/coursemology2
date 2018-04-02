# frozen_string_literal: true
json.topicId @topic.id.to_s
json.topic @topic, partial: 'course/video/topics/topic', as: :topic

json.postId @post.id.to_s
json.post @post, partial: 'course/video/topics/post', as: :post
