# frozen_string_literal: true

json.newInvitations new_invitations.each do |invitation|
  json.partial! 'course_user_invitation_data', invitation: invitation
end

json.existingInvitations existing_invitations.each do |invitation|
  json.partial! 'course_user_invitation_data', invitation: invitation
end

json.newCourseUsers new_course_users.each do |course_user|
  json.partial! 'course/users/user_list_data', course_user: course_user,
                                               should_show_phantom: true, should_show_timeline: true
end

json.existingCourseUsers existing_course_users.each do |course_user|
  json.partial! 'course/users/user_list_data', course_user: course_user,
                                               should_show_phantom: true, should_show_timeline: true
end

json.duplicateUsers duplicate_users.each do |duplicate_user, index|
  json.id index
  json.name duplicate_user[:name]
  json.email duplicate_user[:email]
  json.role duplicate_user[:role]
  json.phantom duplicate_user[:phantom]
  json.timelineAlgorithm duplicate_user[:timeline_algorithm]
end
