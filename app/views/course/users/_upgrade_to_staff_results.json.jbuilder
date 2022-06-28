# frozen_string_literal: true

json.users upgraded_course_users.each do |course_user|
  json.partial! 'user_list_data',
                course_user: course_user,
                should_show_timeline: true,
                should_show_phantom: true
end
