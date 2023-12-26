# frozen_string_literal: true

activity = notification.activity
assessment = activity.object
course_user = @course_users_hash[activity.actor_id]
user = course_user || activity.actor

json.id notification.id

json.userInfo do
  json.name user.name
  json.userUrl url_to_user_or_course_user(current_course, user)
  json.imageUrl user_image(activity.actor)
end

json.actableType 'assessment'
json.actableId assessment.id
json.actableName assessment.title

json.createdAt activity.created_at
