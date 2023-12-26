# frozen_string_literal: true
json.id course.id
json.title course.title
json.createdAt course.created_at
json.activeUserCount course.active_user_count
json.userCount course.user_count
json.instance do
  json.id course.instance.id
  json.name course.instance.name
  json.host course.instance.host
end

json.owners @owner_preload_service.course_owners_for(course.id)&.each do |course_owner|
  json.id course_owner.user.id
  json.name course_owner.user.name
end
