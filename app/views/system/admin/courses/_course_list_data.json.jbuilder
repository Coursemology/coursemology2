# frozen_string_literal: true
json.id course.id
json.title course.title
json.createdAt course.created_at
json.activeUserCount course.active_user_count
json.userCount course.user_count
# The marketplace preview container is a `preview: true` course. It is exposed here so course pickers
# can leave it out of their options; keying off the flag rather than a host or instance id is what
# Course::Assessment::Marketplace::PreviewContainerService guarantees.
json.preview course.preview
json.instance do
  json.id course.instance.id
  json.name course.instance.name
  json.host course.instance.host
end

json.owners @owner_preload_service.course_owners_for(course.id)&.each do |course_owner|
  json.id course_owner.user.id
  json.name course_owner.user.name
end
