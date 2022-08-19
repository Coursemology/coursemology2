# frozen_string_literal: true
posts = topic.posts
posts = topics.posts.with_read_marks_for(current_user) if defined?(read_marks)
posts = posts.calculated(:upvotes, :downvotes).with_user_votes(current_user) if defined?(with_votes)

json.topicPermissions do
  can_toggle_pending = can?(:manage, topic)
  json.canTogglePending can_toggle_pending
  json.canMarkAsRead current_course_user&.student? unless can_toggle_pending
end

json.topicSettings do
  json.isPending topic.pending_staff_reply?
  json.isUnread topic.unread?(current_user)
end

# looping through linked list of posts
json.postList posts.ordered_topologically.flatten.each do |post|
  json.partial! 'course/discussion/posts/post', post: post if can_grade || post.published?
end
