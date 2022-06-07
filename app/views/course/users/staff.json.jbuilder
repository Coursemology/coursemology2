# frozen_string_literal: true
json.users @course_users do |course_user|
  json.partial! 'staff_list_data', course_user: course_user
end

# json.options @student_options do |course_user|
#   json.partial! 'user_basic_list_data', course_user: course_user
# end

json.permissions do
  json.partial! 'permissions_data', current_course: current_course
end
