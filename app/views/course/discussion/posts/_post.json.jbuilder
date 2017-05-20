json.(post, :id, :title, :text)
json.topicId post.topic_id
json.creator post.creator.name
json.createdAt post.created_at
