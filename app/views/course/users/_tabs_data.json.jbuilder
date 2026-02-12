# frozen_string_literal: true
json.requestsCount current_course.enrol_requests.pending.count
json.invitationsCount current_course.invitations.retryable.unconfirmed.count
