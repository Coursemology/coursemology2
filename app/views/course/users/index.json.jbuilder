# frozen_string_literal: true
json.users @course_users do |course_user|
  json.partial! 'user_list_data', course_user: course_user
end
