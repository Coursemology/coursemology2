# frozen_string_literal: true
should_show_timeline ||= false
should_show_phantom ||= false

json.id course_user.id if course_user.id
json.name course_user.name.strip
json.imageUrl user_image(course_user.user)
json.email course_user.user.email

json.timelineAlgorithm course_user.timeline_algorithm if should_show_timeline

json.role course_user.role
json.phantom course_user.phantom? if should_show_phantom
