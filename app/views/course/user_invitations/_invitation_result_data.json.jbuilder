# frozen_string_literal: true

json.newInvitations new_invitations.each do |invitation|
  json.id invitation.id
  json.name invitation.name
  json.email invitation.email
  json.externalId invitation.external_id
  json.role invitation.role
  json.phantom invitation.phantom
  json.sentAt invitation.sent_at
  json.timelineAlgorithm invitation.timeline_algorithm
end

json.existingInvitations existing_invitations.each do |invitation|
  json.id invitation.id
  json.name invitation.name
  json.email invitation.email
  json.externalId invitation.external_id
  json.role invitation.role
  json.phantom invitation.phantom
  json.sentAt invitation.sent_at
  json.isRetryable invitation.is_retryable
  json.timelineAlgorithm invitation.timeline_algorithm
end

json.newCourseUsers new_course_users.each do |course_user|
  json.id course_user.id if course_user.id
  json.name course_user.name.strip
  json.email course_user.user.email
  json.externalId course_user.external_id
  json.role course_user.role
  json.phantom course_user.phantom?
  json.timelineAlgorithm course_user.timeline_algorithm
end

json.existingCourseUsers existing_course_users.each do |course_user|
  json.id course_user.id if course_user.id
  json.name course_user.name.strip
  json.email course_user.user.email
  json.externalId course_user.external_id
  json.role course_user.role
  json.phantom course_user.phantom?
  json.timelineAlgorithm course_user.timeline_algorithm
end

json.failedUsers failed_users.each.with_index do |failed_user, index|
  json.id index
  json.name failed_user[:name]
  json.email failed_user[:email]
  json.externalId failed_user[:external_id]
  json.role failed_user[:role]
  json.phantom failed_user[:phantom]
  json.reason failed_user[:reason]
  json.timelineAlgorithm failed_user[:timeline_algorithm]
end

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
