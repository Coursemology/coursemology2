# frozen_string_literal: true
json.courseUser do
  json.id course_user.id
  json.name course_user.name
  json.role course_user.role
  json.isPhantom course_user.phantom?
  json.email course_user.user.email
end
