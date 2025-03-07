# frozen_string_literal: true

json.isTopicResolved topic.resolved?
json.workflowState post.workflow_state
json.partial! 'course/forum/posts/post_creator_data', post: post
