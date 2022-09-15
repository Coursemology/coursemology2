# frozen_string_literal: true
json.roleRequests @user_role_requests.each do |role_request|
  json.partial! 'instance_user_role_request_list_data', role_request: role_request
end
