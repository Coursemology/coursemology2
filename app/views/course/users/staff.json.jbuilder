# frozen_string_literal: true
should_show_timeline = current_course.show_personalized_timeline_features? &&
                       can?(:manage_personal_times, current_course)
should_show_phantom = can?(:manage, CourseUser.new(course: current_course))

json.users @course_users do |course_user|
  json.partial! 'user_list_data', course_user: course_user,
                                  should_show_phantom: should_show_phantom,
                                  should_show_timeline: should_show_timeline
end

json.permissions do
  json.partial! 'permissions_data', current_course: current_course
end

json.manageCourseUsersData do
  json.partial! 'tabs_data', current_course: current_course
end
