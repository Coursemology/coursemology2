# frozen_string_literal: true
json.rowCount @experience_points_count
json.experiencePointRecords @experience_points_records do |record|
  json.partial! 'experience_points_record', course: current_course, record: record
  json.courseUserName record.course_user.user.name
  json.userExperienceUrl course_user_experience_points_records_path(current_course, record.course_user_id)
end