# frozen_string_literal: true
json.users @course_users do |course_user|
  json.partial! 'student_list_data', course_user: course_user
end

json.permissions do
  json.partial! 'permissions_data', current_course: current_course
end
