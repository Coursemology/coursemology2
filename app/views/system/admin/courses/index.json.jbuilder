total_course = Course.unscoped.count
active_course = Course.unscoped.active_in_past_7_days.count

json.totalCourses total_course
json.activeCourses active_course

json.courses @courses.each do |course|
    json.partial! 'course_list_data', course: course
end
