# frozen_string_literal: true

json.invitations @invitations.each do |invitation|
  json.partial! 'course_user_invitation_list_data', invitation: invitation
end
