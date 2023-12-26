# frozen_string_literal: true

activity = notification.activity
topic = activity.object
course_user = @course_users_hash[activity.actor_id]
user = course_user || activity.actor

json.id notification.id

json.userInfo do
  json.name user.name
  json.userUrl url_to_user_or_course_user(current_course, user)
  json.imageUrl user_image(activity.actor)
end

json.actableType 'topicCreate'
json.actableId topic.id
json.actableName topic.title

json.forumName topic.forum.slug
json.topicName topic.slug

json.createdAt activity.created_at
