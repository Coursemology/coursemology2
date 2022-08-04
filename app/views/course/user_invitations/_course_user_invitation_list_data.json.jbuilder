# frozen_string_literal: true
# When changing the following, need to ensure that
# user_invitations/_course_user_invitation_list is also changed.

json.id invitation.id
json.name invitation.name
json.email invitation.email
json.role invitation.role
json.phantom invitation.phantom
json.timelineAlgorithm invitation.timeline_algorithm
json.invitationKey invitation.invitation_key
json.confirmed invitation.confirmed?
json.sentAt format_datetime(invitation.sent_at, :short) if invitation.sent_at
json.confirmedAt format_datetime(invitation.confirmed_at, :short) if invitation.confirmed_at
