# frozen_string_literal: true
json.partial! 'course/users/user', locals: { user: post.creator }

json.createdAt format_datetime(post.created_at)
json.content format_html(simple_format(post.text))
json.rawContent post.text
json.canUpdate can?(:update, post)
json.canDelete can?(:destroy, post)
json.topicId post.topic.specific.id.to_s
json.discussionTopicId post.topic.id.to_s
json.childrenIds post.children.map(&:id).map(&:to_s)
