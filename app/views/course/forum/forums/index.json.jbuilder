# frozen_string_literal: true

json.forumTitle @settings.title || ''

json.forums @forums do |forum|
  json.partial! 'forum_list_data', forum: forum, isUnresolved: @unresolved_forums_ids.include?(forum.id)
end

json.permissions do
  json.canCreateForum can?(:create, Course::Forum.new(course: current_course))
end

json.metadata do
  json.nextUnreadTopicUrl next_unread_topic_link
end
