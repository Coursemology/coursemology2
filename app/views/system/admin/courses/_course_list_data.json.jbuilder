json.id course.id
json.title format_inline_text(course.title)
json.createdAt format_datetime(course.created_at, :date_only_long)
json.activeUserCount course.active_user_count
json.userCount course.user_count
json.instance do
  json.id course.instance.id
  json.name format_inline_text(course.instance.name)
  json.host course.instance.host
end

json.owners @owner_preload_service.course_owners_for(course.id)&.each do |course_owner|
  json.id course_owner.user.id
  json.name course_owner.user.name
end
