# frozen_string_literal: true
json.rowCount @experience_points_count
json.studentName @course_user.name

json.records @experience_points_records do |experience_points_record|
  json.partial! 'experience_points_record', course: current_course, record: experience_points_record
end
