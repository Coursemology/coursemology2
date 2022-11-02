# frozen_string_literal: true

json.id post.id
json.topicId @topic.id
json.parentId post.parent_id
json.postUrl course_forum_topic_post_path(current_course, @forum, @topic, post)
json.text post.text
json.createdAt post.created_at
json.isAnswer post.answer
json.isUnread post.unread?(current_user)
json.hasUserVoted !post.vote_for(current_user).nil?
json.userVoteFlag post.vote_for(current_user)&.vote_flag?
json.voteTally post.vote_tally

json.creator do
  creator = post.creator
  user = @course_users_hash&.fetch(creator.id, creator) || creator
  json.id user.id
  json.userUrl url_to_user_or_course_user(current_course, user)
  json.name display_user(user)
  json.imageUrl user_image(creator)
end

json.permissions do
  json.canEditPost can?(:edit, post)
  json.canDeletePost can?(:destroy, post)
  json.canReplyPost can?(:reply, @topic)
end
