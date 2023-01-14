# frozen_string_literal: true
should_show_timeline ||= false
should_show_phantom ||= false

json.id course_user.id if course_user.id
json.name course_user.name.strip
json.imageUrl user_image(course_user.user)
json.email course_user.user.email

reference_timeline_id = course_user.reference_timeline_id
json.referenceTimelineId reference_timeline_id || current_course.default_reference_timeline.id
json.timelineAlgorithm course_user.timeline_algorithm if should_show_timeline

json.role course_user.role
json.phantom course_user.phantom? if should_show_phantom

json.groups course_user.groups.map(&:name)
