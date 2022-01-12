# frozen_string_literal: true
json.categories @categories do |category|
  json.id category.id
  json.name category.name
  json.description category.description
  json.groups category.groups do |group|
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
  end
end

json.courseUsers @course_users do |course_user|
  json.id course_user.id
  json.name course_user.name
  json.role course_user.role
  json.isPhantom course_user.phantom?
end
