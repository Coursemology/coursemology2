# frozen_string_literal: true
json.id enrol_request.id
if enrol_request.approved?
  course_user = CourseUser.find_by(course_id: enrol_request.course_id, user_id: enrol_request.user_id)
  json.name course_user&.name || enrol_request.user.name
  json.role course_user&.role || nil
  json.phantom course_user&.phantom || nil
else
  json.name enrol_request.user.name
end
json.email enrol_request.user.email
json.status enrol_request.workflow_state
json.createdAt format_datetime(enrol_request.created_at, :short)
json.confirmedBy enrol_request.confirmer.name unless enrol_request.pending?
json.confirmedAt format_datetime(enrol_request.confirmed_at, :short) unless enrol_request.pending?
