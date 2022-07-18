# frozen_string_literal: true

json.filters do
  json.startTime @disbursement.start_time
  json.endTime @disbursement.end_time
  json.weeklyCap @disbursement.weekly_cap
end

json.forumUsers @disbursement.experience_points_records do |record_fields|
  json.partial! 'forum_disbursement_user_data', course_user: record_fields.course_user
  json.points record_fields.points_awarded
end
