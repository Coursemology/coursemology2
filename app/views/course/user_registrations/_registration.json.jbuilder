# frozen_string_literal: true

if current_user
  display_code_form = current_course.code_registration_enabled? || current_course.invitations.unconfirmed.exists?
  json.isDisplayCodeForm display_code_form

  invitation = current_course.invitations.unconfirmed.for_user(current_user)
  json.isInvited invitation.present?

  enrol_request = Course::EnrolRequest.find_by(course: current_course, user: current_user, workflow_state: 'pending')
  json.enrolRequestId enrol_request&.id
end

json.isEnrollable current_course.enrollable?
