# frozen_string_literal: true

json.id forum.id
json.name forum.name
json.description format_ckeditor_rich_text(forum.description)
json.rootForumUrl course_forums_path(current_course)
json.forumUrl course_forum_path(current_course, forum)
json.forumTopicsAutoSubscribe forum.forum_topics_auto_subscribe
json.topicUnreadCount forum.topic_unread_count
json.isUnresolved isUnresolved
json.topicCount forum.topic_count
json.topicPostCount forum.topic_post_count
json.topicViewCount forum.topic_view_count

json.emailSubscription do
  json.isCourseEmailSettingEnabled email_setting_enabled_current_course_user(:forums, :new_topic)
  json.isUserEmailSettingEnabled email_subscription_enabled_current_course_user(:forums, :new_topic)
  json.isUserSubscribed forum.subscribed_by?(current_user)
  if current_course_user && can?(:manage, Course::UserEmailUnsubscription.new(course_user: current_course_user))
    json.manageEmailSubscriptionUrl course_user_manage_email_subscription_path(current_course, current_course_user)
  end
end

json.permissions do
  json.canEditForum can?(:edit, forum)
  json.canDeleteForum can?(:destroy, forum)
end
