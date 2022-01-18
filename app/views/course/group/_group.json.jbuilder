# frozen_string_literal: true
json.id group.id
json.name group.name
json.description group.description
json.members group.group_users do |user|
  json.id user.id
  json.courseUserId user.course_user.id
  json.name user.course_user.name
  json.role user.course_user.role
  json.isPhantom user.course_user.phantom?
  json.groupRole user.role
end
