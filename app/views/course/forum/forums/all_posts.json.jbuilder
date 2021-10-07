# frozen_string_literal: true
json.posts @topic_posts do |topic, posts|
  json.topic do
    json.id topic.id
    json.title topic.title
  end

  json.posts posts do |post|
    json.id post.id
    json.text post.text
    json.parent_id post.parent_id
  end
end