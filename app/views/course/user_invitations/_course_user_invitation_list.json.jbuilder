# frozen_string_literal: true
# The followings are duplicate from _course_user_invitation_list_data.json
# We are not using _course_user_invitation_list_data.json as nested jbuilder compromises
# the performance. When changing the following, need to ensure that
# _course_user_invitation_list_data.json is also changed.

json.invitations @invitations.each do |invitation|
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
end
