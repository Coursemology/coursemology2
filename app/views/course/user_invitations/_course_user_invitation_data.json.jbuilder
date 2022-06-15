# frozen_string_literal: true

serial_number = defined?(invitation_counter) ? invitation_counter + 1 : serial_number

json.id invitation.id
json.name invitation.name
json.email invitation.email
json.role invitation.role
json.phantom invitation.phantom
json.invitationKey invitation.invitation_key
json.confirmed invitation.confirmed?
json.sentAt format_datetime(invitation.sent_at, :short) if invitation.sent_at
unless invitation.confirmed?
  json.resendInvitationUrl course_user_invitation_resend_invitation_path(current_course,
                                                                         invitation,
                                                                         serial_number: serial_number)
end
json.confirmedAt format_datetime(invitation.confirmed_at, :short) if invitation.confirmed_at
