# frozen_string_literal: true
json.rowCount @experience_points_count
json.experiencePointRecords @experience_points_records do |record|
  json.partial! 'experience_points_record', course: current_course, record: record
  json.courseUserName record.course_user.name
  json.userExperienceUrl course_user_experience_points_records_path(current_course, record.course_user_id)
end

if can?(:read_all_exp_points, current_course)
  students = current_course.course_users.order_alphabetically.student
  json.filter do
    json.names students do |student|
      json.id student.id
      json.name student.name
    end
  end
end
