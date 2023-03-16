# frozen_string_literal: true

json.courses @courses do |course|
  json.partial! 'course_list_data', course: course
end

request = current_tenant.user_role_requests.find_by(user_id: current_user&.id, workflow_state: 'pending')

if request
  json.instanceUserRoleRequest do
    json.id request.id
    json.role request.role
    json.organization request.organization
    json.designation request.designation
    json.reason format_ckeditor_rich_text(request.reason)
  end
end

json.permissions do
  json.canCreate can?(:create, Course.new)
  json.isCurrentUser current_user.present?
end
