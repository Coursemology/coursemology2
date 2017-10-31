json.timestamp topic.timestamp
json.discussionTopicId topic.discussion_topic.id.to_s
json.topLevelPostIds(
  topic.
    discussion_topic.
    posts.
    ordered_topologically.
    map { |post, _| post.id.to_s }
)
