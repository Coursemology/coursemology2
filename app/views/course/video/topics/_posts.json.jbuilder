# frozen_string_literal: true
json.posts do
  posts.each do |post|
    json.set! post.id do
      json.partial! 'course/video/topics/post', locals: { post: post }
    end
  end
end
