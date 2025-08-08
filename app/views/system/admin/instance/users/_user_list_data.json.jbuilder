# frozen_string_literal: true
json.id instance_user.id
json.userId instance_user.user.id
json.name instance_user.user.name
json.email instance_user.user.email
json.role instance_user.role
json.courses instance_user.user.courses.each do |course|
  json.id course.id
  json.title course.title
end
