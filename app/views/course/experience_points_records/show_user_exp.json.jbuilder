# frozen_string_literal: true
json.rowCount @experience_points_count
json.courseUserName @course_user.name

json.experiencePointRecords @experience_points_records do |experience_points_record|
  json.partial! 'experience_points_record', course: current_course, record: experience_points_record
  json.permissions do
    json.canUpdate can?(:update, experience_points_record)
    json.canDestroy experience_points_record.manually_awarded? && can?(:destroy, experience_points_record)
  end
end
