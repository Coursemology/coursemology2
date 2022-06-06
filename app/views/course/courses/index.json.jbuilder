# frozen_string_literal: true

json.courses @courses do |course|
  json.partial! 'courses_list_data', course: course
end

request = current_tenant.user_role_requests.find_by(user_id: current_user&.id)

if request
  json.instanceUserRoleRequestId current_tenant.user_role_requests.find_by(user_id: current_user&.id).id
else
  json.instanceUserRoleRequestId request
end

json.permissions do
  json.canCreate can?(:create, Course.new)
end
