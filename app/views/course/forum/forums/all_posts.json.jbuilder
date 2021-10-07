# frozen_string_literal: true
json.topic_posts @topic_posts do |topic, posts|
  json.topic do
    json.id topic.id
    json.title topic.title
  end

  json.posts posts do |post|
    json.post do
      json.id post.id
      json.text post.text
    end
    if post.parent_id
      json.parent do
        json.id post.parent.id
        json.text post.parent.text
      end
    end
  end
end
