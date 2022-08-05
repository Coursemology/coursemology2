# frozen_string_literal: true
json.id course.id
json.title course.title
json.createdAt format_datetime(course.created_at, :date_only_long)
json.activeUserCount course.active_user_count
json.userCount course.user_count

json.owners @owner_preload_service.course_owners_for(course.id)&.each do |course_owner|
  json.id course_owner.user.id
  json.name course_owner.user.name
end
