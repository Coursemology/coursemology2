# frozen_string_literal: true

display_code_form = current_course.code_registration_enabled? || current_course.invitations.unconfirmed.count > 0
invitation = current_course.invitations.unconfirmed.for_user(current_user)

json.isDisplayCodeForm display_code_form
json.isInvited invitation.present?

enrol_request = Course::EnrolRequest.find_by(course: current_course, user: current_user, workflow_state: 'pending')

json.enrolRequestId enrol_request&.id

json.isEnrollable current_course.enrollable?
