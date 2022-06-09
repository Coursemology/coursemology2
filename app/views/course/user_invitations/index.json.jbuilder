# frozen_string_literal: true
json.invitations @invitations.each do |invitation|
  json.partial! 'course_user_invitation', invitation: invitation
end

json.permissions do
  json.partial! 'course/users/permissions_data', current_course: current_course
end

json.manageCourseUsersData do
  json.partial! 'course/users/tabs_data', current_course: current_course
end
