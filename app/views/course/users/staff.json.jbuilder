# frozen_string_literal: true
should_show_timeline = current_course.show_personalized_timeline_features? &&
                       can?(:manage_personal_times, current_course)
should_show_phantom = can?(:manage_users, current_course)

json.users @course_users do |course_user|
  json.partial! 'user_list_data', course_user: course_user,
                                  should_show_phantom: should_show_phantom,
                                  should_show_timeline: should_show_timeline
end

json.userOptions @student_options do |course_user|
  # course_user comes from @student_options which only plucks(:id, :name)
  json.id course_user[0]
  json.name course_user[1]
  json.role course_user[2]
end

json.permissions do
  json.partial! 'permissions_data', current_course: current_course
end

json.manageCourseUsersData do
  json.partial! 'tabs_data', current_course: current_course
end
