# frozen_string_literal: true

json.pendingInvitationUpdates pending_invitation_updates do |item|
  inv = item[:record]
  json.id                inv.id
  json.name              inv.name
  json.email             inv.email
  json.externalId        item[:new_external_id]
  json.previousExternalId item[:previous_external_id]
  json.role              inv.role
  json.phantom           inv.phantom
  json.timelineAlgorithm inv.timeline_algorithm
end

json.pendingCourseUserUpdates pending_course_user_updates do |item|
  cu = item[:record]
  json.id                cu.id
  json.name              cu.name.strip
  json.email             cu.user.email
  json.externalId        item[:new_external_id]
  json.previousExternalId item[:previous_external_id]
  json.role              cu.role
  json.phantom           cu.phantom?
  json.timelineAlgorithm cu.timeline_algorithm
end
