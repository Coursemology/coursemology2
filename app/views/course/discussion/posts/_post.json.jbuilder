json.(post, :id, :title, :text)
json.creator post.creator.name
json.createdAt post.created_at
json.topicId post.topic_id
