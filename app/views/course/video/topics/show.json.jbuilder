# frozen_string_literal: true
json.topicId @topic.id.to_s
json.topic @topic, partial: 'course/video/topics/topic', as: :topic

json.posts do
  @topic.posts.each do |post|
    json.set! post.id do
      json.partial! 'course/video/topics/post', locals: { post: post }
    end
  end
end
