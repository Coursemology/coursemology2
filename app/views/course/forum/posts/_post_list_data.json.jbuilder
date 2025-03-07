# frozen_string_literal: true

json.id post.id
json.topicId topic.id
json.parentId post.parent_id
json.postUrl course_forum_topic_post_path(current_course, forum, topic, post)
json.text format_ckeditor_rich_text(post.text)
json.createdAt post.created_at
json.isAnswer post.answer
json.isUnread post.unread?(current_user)
json.hasUserVoted !post.vote_for(current_user).nil?
json.userVoteFlag post.vote_for(current_user)&.vote_flag?
json.voteTally post.vote_tally
json.workflowState post.workflow_state
json.isAiGenerated post.is_ai_generated

json.partial! 'course/forum/posts/post_creator_data', post: post

json.permissions do
  json.canEditPost can?(:edit, post)
  json.canDeletePost can?(:destroy, post)
  json.canReplyPost can?(:reply, topic)
  json.canViewAnonymous can?(:view_anonymous, post)
  json.isAnonymousEnabled current_course.settings(:course_forums_component).allow_anonymous_post
end
