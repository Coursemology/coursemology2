# frozen_string_literal: true

json.courses @courses do |course|
  json.partial! 'course_list_data', course: course
end

request = current_tenant.user_role_requests.find_by(user_id: current_user&.id, workflow_state: 'pending')

json.instanceUserRoleRequestId request&.id

json.permissions do
  json.canCreate can?(:create, Course.new)
end
