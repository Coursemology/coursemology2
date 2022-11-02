# frozen_string_literal: true

# looping through linked list of posts
json.postList topic.posts.ordered_topologically.flatten.each do |post|
  json.partial! 'course/discussion/posts/post', post: post if can_grade || post.published?
end

json.topicPermissions do
  can_toggle_pending = can?(:manage, topic)
  json.canTogglePending can_toggle_pending
  json.canMarkAsRead current_course_user&.student? unless can_toggle_pending
end

json.topicSettings do
  json.isPending topic.pending_staff_reply?
  json.isUnread topic.unread?(current_user)
end
