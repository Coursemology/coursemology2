# frozen_string_literal: true
json.users @course_users do |course_user|
  json.partial! 'user_list_data', course_user: course_user
end

unless current_course_user.student?
  json.permissions do
    json.partial! 'permissions_data', current_course: current_course
  end

  json.manageCourseUsersData do
    json.partial! 'tabs_data', current_course: current_course
  end
end
