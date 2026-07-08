# frozen_string_literal: true
json.id @user.id
json.confirmed @user.confirmed?
if @enrol_request.present?
  json.enrolRequest do
    json.partial! 'course/enrol_requests/enrol_request_list_data', enrol_request: @enrol_request
  end
end
