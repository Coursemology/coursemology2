# frozen_string_literal: true
allow_anonymous_post = current_course.settings(:course_forums_component).allow_anonymous_post
is_anonymous = post.is_anonymous && allow_anonymous_post

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
json.isAnonymous is_anonymous

if (is_anonymous && can?(:view_anonymous, post)) || !is_anonymous
  json.creator do
    creator = post.creator
    user = @course_users_hash&.fetch(creator.id, creator) || creator
    json.id user.id
    json.userUrl url_to_user_or_course_user(current_course, user)
    json.name display_user(user)
    json.imageUrl user_image(creator)
  end
end

json.permissions do
  json.canEditPost can?(:edit, post)
  json.canDeletePost can?(:destroy, post)
  json.canReplyPost can?(:reply, @topic)
  json.canViewAnonymous can?(:view_anonymous, post)
  json.isAnonymousEnabled allow_anonymous_post
end
