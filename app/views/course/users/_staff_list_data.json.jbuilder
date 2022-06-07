# frozen_string_literal: true

json.partial! 'user_basic_list_data', course_user: course_user
json.email course_user.user.email

json.timelineAlgorithm course_user.timeline_algorithm if current_course.show_personalized_timeline_features?

json.role course_user.role
json.phantom course_user.phantom?
