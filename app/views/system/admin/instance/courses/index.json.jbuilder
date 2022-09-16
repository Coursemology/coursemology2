# frozen_string_literal: true
total_course = Course.count
active_course = Course.active_in_past_7_days.count

json.totalCourses total_course
json.activeCourses active_course
json.coursesCount @courses_count

json.courses @courses.each do |course|
  json.partial! 'system/admin/courses/course_list_data', course: course
end
