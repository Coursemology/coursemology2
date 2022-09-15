# frozen_string_literal: true
json.newInvitations new_invitations.each do |invitation|
  json.id invitation.id
  json.name invitation.name
  json.email invitation.email
  json.role invitation.role
  json.sentAt format_datetime(invitation.sent_at, :short) if invitation.sent_at
end

json.existingInvitations existing_invitations.each do |invitation|
  json.id invitation.id
  json.name invitation.name
  json.email invitation.email
  json.role invitation.role
  json.sentAt format_datetime(invitation.sent_at, :short) if invitation.sent_at
end

json.newInstanceUsers new_instance_users.each do |instance_user|
  user = instance_user.user
  json.id user.id if user.id
  json.name user.name.strip
  json.email user.email
  json.role user.role
end

json.existingInstanceUsers existing_instance_users.each do |instance_user|
  user = instance_user.user
  json.id user.id if user.id
  json.name user.name.strip
  json.email user.email
  json.role user.role
end

json.duplicateUsers duplicate_users.each do |duplicate_user, index|
  json.id index
  json.name duplicate_user[:name]
  json.email duplicate_user[:email]
  json.role duplicate_user[:role]
end
