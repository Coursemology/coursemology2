# frozen_string_literal: true

json.courseGroups current_course.groups.each do |group|
  json.id group.id
  json.name group.name.strip
end

json.courseUsers @disbursement.experience_points_records do |record_fields|
  json.id record_fields.course_user.id
  json.name record_fields.course_user.name.strip
  json.groupIds record_fields.course_user.group_users.pluck(:group_id)
end
