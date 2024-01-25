# frozen_string_literal: true
json.story do
  json.id @story.id
  json.title @story.title
end

json.room do
  json.id @room.id
  json.providedRoomId @room.provided_room_id
  json.creatorCourseUserId @creator_course_user.id
  json.creatorCourseUserName @creator_course_user.name
  json.startedAt @room.created_at
  json.completedAt @room.completed_at
end
