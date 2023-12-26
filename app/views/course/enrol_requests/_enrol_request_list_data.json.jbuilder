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
json.createdAt enrol_request.created_at
json.confirmedBy enrol_request.confirmer.name unless enrol_request.pending?
json.confirmedAt enrol_request.confirmed_at unless enrol_request.pending?
