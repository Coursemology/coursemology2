# frozen_string_literal: true

json.course do
  json.partial! 'course_data'
  json.permissions do
    json.isCurrentCourseUser current_course.user?(current_user)
    json.canManage can?(:manage, current_course)
  end
end
