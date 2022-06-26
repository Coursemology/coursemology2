# frozen_string_literal: true

activity = notification.activity
achievement = activity.object
course_user = @course_users_hash[activity.actor_id]

json.id notification.id

json.userInfo do
  if course_user
    json.id course_user.id
    json.name course_user.name
  else
    json.id activity.actor_id
    json.name activity.actor.name
  end
  json.imageUrl activity.actor.profile_photo.url
end

json.isCourseUser course_user.present?

json.actableType 'achievement'
json.actableId achievement.id
json.actableName achievement.title

json.createdAt format_datetime(activity.created_at)
