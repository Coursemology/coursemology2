# frozen_string_literal: true

if @disbursement.group
  json.currentGroup do
    json.partial! 'disbursement_group_list_data', group: @disbursement.group
  end
else
  json.currentGroup nil
end

json.courseGroups current_course.groups.each do |group|
  json.partial! 'disbursement_group_list_data', group: group
end

json.courseUsers @disbursement.experience_points_records do |record_fields|
  json.id record_fields.course_user.id
  json.name record_fields.course_user.name.strip
end
