# frozen_string_literal: true

json.id group.id
json.name group.name.strip

json.users group.course_users.includes(:user, :course).students.each do |user|
  json.id user.id
  json.name user.name.strip
end
