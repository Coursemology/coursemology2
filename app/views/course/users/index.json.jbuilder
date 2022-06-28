# frozen_string_literal: true

json.users @course_users do |course_user|
  json.partial! 'user_list_data', course_user: course_user, should_show_timeline: false, should_show_phantom: false
end

unless @user_options.nil?
  json.userOptions @user_options do |course_user|
    json.partial! 'user_basic_list_data', course_user: course_user
  end
end

unless current_course_user.student?
  json.permissions do
    json.partial! 'permissions_data', current_course: current_course
  end

  json.manageCourseUsersData do
    json.partial! 'tabs_data', current_course: current_course
  end
end
