# frozen_string_literal: true
json.rowCount @experience_points_count
json.records @experience_points_records.includes(:course_user) do |record|
  json.partial! 'experience_points_record', course: current_course, record: record
end

course_students = current_course.course_users.order_alphabetically.student
json.filters do
  json.courseStudents course_students do |student|
    json.id student.id
    json.name student.name
  end
end
