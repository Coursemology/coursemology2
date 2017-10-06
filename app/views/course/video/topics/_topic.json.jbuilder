json.timestamp topic.timestamp
json.topLevelPostIds(
  topic.
    discussion_topic.
    posts.
    ordered_topologically.
    map { |post, _| post.id.to_s }
)
