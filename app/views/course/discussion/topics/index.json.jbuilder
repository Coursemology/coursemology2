# frozen_string_literal: true

json.permissions do
  json.canManage current_course_user&.teaching_staff? || can?(:manage, current_course)
  json.isStudent current_course_user&.student?
  json.isTeachingStaff current_course_user&.teaching_staff?
end

json.settings do
  json.title @settings.title || ''
  json.topicsPerPage @settings.pagination
end

json.partial! 'tabs'
