# frozen_string_literal: true
json.user do
  json.partial! 'user_data', course_user: @course_user
end
