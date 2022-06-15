# frozen_string_literal: true
json.id enrol_request.id
json.name enrol_request.user.name unless enrol_request.approved?
json.email enrol_request.user.email
json.status enrol_request.workflow_state
if enrol_request.approved?
  course_user = CourseUser.find_by(course_id: enrol_request.course_id, user_id: enrol_request.user_id)
  json.phantom course_user&.phantom || nil
  json.role course_user&.role || '-'
  json.name course_user&.name || enrol_request.user.name
end
json.createdAt format_datetime(enrol_request.created_at, :short)
json.confirmedBy enrol_request.confirmer.name unless enrol_request.pending?
json.confirmedAt format_datetime(enrol_request.confirmed_at, :short) unless enrol_request.pending?
