# frozen_string_literal: true
unless @without_invitations
  json.partial! 'course_user_invitation_list'
end

json.permissions do
  json.partial! 'course/users/permissions_data', current_course: current_course
end

json.manageCourseUsersData do
  json.partial! 'course/users/tabs_data', current_course: current_course
  json.defaultTimelineAlgorithm current_course.default_timeline_algorithm
end
