# frozen_string_literal: true
json.story do
  json.id @story.id
  json.title @story.title
end

json.rooms @rooms do |room|
  course_user = @course_users_hash[room.creator_id]

  json.id room.id
  json.creatorCourseUserId course_user.id
  json.creatorCourseUserName course_user.name
  json.startedAt room.created_at
  json.completedAt room.completed_at
end
