# frozen_string_literal: true

activity = notification.activity
video = activity.object
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

json.actableType 'video'
json.actableId video.id
json.actableName video.title

json.createdAt format_datetime(activity.created_at)
