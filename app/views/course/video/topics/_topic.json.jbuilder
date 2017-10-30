json.timestamp topic.timestamp
json.createdTimestamp topic.created_at.to_i
json.discussionTopicId topic.discussion_topic.id.to_s
json.topLevelPostIds(
  topic.
    discussion_topic.
    posts.
    ordered_topologically.
    map { |post, _| post.id.to_s }
)
