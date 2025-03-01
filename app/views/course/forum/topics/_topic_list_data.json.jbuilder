# frozen_string_literal: true
first_post = topic.posts.first
last_post = if current_course_user&.teaching_staff?
              topic.posts.last
            else
              topic.posts.where.not(workflow_state: 'draft').last
            end

json.id topic.id
json.forumId forum.id
json.title topic.title
json.forumUrl course_forum_path(current_course, forum)
json.topicUrl course_forum_topic_path(current_course, forum, topic)
json.isUnread topic.unread?(current_user)
json.isLocked topic.locked?
json.isHidden topic.hidden?
json.isResolved topic.resolved?
json.topicType topic.topic_type

json.voteCount topic.vote_count
json.postCount topic.post_count
json.viewCount topic.view_count

if first_post
  json.firstPostCreator do
    json.partial! 'course/forum/posts/post_creator_data', post: first_post
  end
end

if last_post
  json.latestPostCreator do
    json.partial! 'course/forum/posts/post_creator_data', post: last_post
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
  if current_course_user && can?(:manage, Course::UserEmailUnsubscription.new(course_user: current_course_user))
    json.manageEmailSubscriptionUrl course_user_manage_email_subscription_path(current_course, current_course_user)
  end
end

json.permissions do
  json.canEditTopic can?(:edit, topic)
  json.canDeleteTopic can?(:destroy, topic)
  json.canSubscribeTopic can?(:subscribe, topic)
  json.canSetHiddenTopic can?(:set_hidden, topic)
  json.canSetLockedTopic can?(:set_locked, topic)
  json.canReplyTopic can?(:reply, topic)
  json.canToggleAnswer can?(:toggle_answer, topic)
  json.isAnonymousEnabled current_course.settings(:course_forums_component).allow_anonymous_post
  json.canManageAIResponse can?(:publish, topic) && current_course.component_enabled?(Course::RagWiseComponent)
end
