# frozen_string_literal: true
json.id instance.id
json.name instance.name
json.host instance.host
json.activeUserCount instance.active_user_count
json.userCount instance.user_count
json.activeCourseCount instance.active_course_count
json.courseCount instance.course_count

json.canEdit can?(:edit, instance)
json.canDelete can?(:destroy, instance)
