# frozen_string_literal: true
json.courses @courses do |course|
  json.id course.id
  json.title course.title
  json.description course.description
  json.course course_path(course)
  json.logo display_course_logo(course)
end

json.permissions do
  json.canCreate can?(:create, Course.new)
  json.requestSubmitted current_tenant.user_role_requests.find_by(user_id: current_user&.id)
end
