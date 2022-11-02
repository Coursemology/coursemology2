# frozen_string_literal: true

json.forum do
  json.partial! 'forum_list_data', forum: forum,
                                   isUnresolved: Course::Forum::Topic.filter_unresolved_forum(forum.id).present?
  json.availableTopicTypes topic_type_keys(Course::Forum::Topic.new(forum: @forum))
  json.topicIds @topics.pluck(:id)
  json.permissions do
    json.canCreateTopic can?(:create, Course::Forum::Topic.new(forum: @forum))
  end
end

json.topics @topics do |topic|
  json.partial! 'course/forum/topics/topic_list_data', forum: forum, topic: topic
end
