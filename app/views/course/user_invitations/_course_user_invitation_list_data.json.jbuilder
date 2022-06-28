# frozen_string_literal: true
json.id invitation.id
json.name invitation.name
json.email invitation.email
json.role invitation.role
json.phantom invitation.phantom
json.invitationKey invitation.invitation_key
json.confirmed invitation.confirmed?
json.sentAt format_datetime(invitation.sent_at, :short) if invitation.sent_at
json.confirmedAt format_datetime(invitation.confirmed_at, :short) if invitation.confirmed_at
