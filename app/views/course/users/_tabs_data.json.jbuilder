# frozen_string_literal: true
json.requestsCount current_course.enrol_requests.count
json.invitationsCount current_course.invitations.unconfirmed.count
