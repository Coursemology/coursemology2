# frozen_string_literal: true

json.id topic.id
json.forumId forum.id
json.title topic.title
json.topicUrl course_forum_topic_path(current_course, forum, topic)
json.isUnread topic.unread?(current_user)
json.isLocked topic.locked?
json.isHidden topic.hidden?
json.isResolved topic.resolved?
json.topicType topic.topic_type
json.creator do
  creator = topic.creator
  user = @course_users_hash&.fetch(creator.id, creator) || creator
  json.id user.id
  json.userUrl url_to_user_or_course_user(current_course, user)
  json.name display_user(user)
end

json.voteCount topic.vote_count
json.postCount topic.post_count
json.viewCount topic.view_count

last_post = topic.posts.last
if last_post
  json.latestPost do
    json.creator do
      creator = last_post.creator
      user = @course_users_hash&.fetch(creator.id, creator) || creator
      json.id user.id
      json.userUrl url_to_user_or_course_user(current_course, user)
      json.name display_user(user)
    end
    json.createdAt last_post.created_at
  end
end

json.emailSubscription do
  json.isCourseEmailSettingEnabled email_setting_enabled_current_course_user(:forums, :post_replied)
  json.isUserEmailSettingEnabled email_subscription_enabled_current_course_user(:forums, :post_replied)
  is_user_subscribed = if @subscribed_discussion_topic_ids
                         @subscribed_discussion_topic_ids&.include?(topic.discussion_topic.id)
                       else
                         topic.subscribed_by?(current_user)
                       end
  json.isUserSubscribed is_user_subscribed
end

json.permissions do
  json.canEditTopic can?(:edit, topic)
  json.canDeleteTopic can?(:destroy, topic)
  json.canSubscribeTopic can?(:subscribe, topic)
  json.canSetHiddenTopic can?(:set_hidden, topic)
  json.canSetLockedTopic can?(:set_locked, topic)
  json.canResolveTopic can?(:resolve, topic)
  json.canReplyTopic can?(:reply, topic)
  json.canToggleAnswer can?(:toggle_answer, topic)
end
