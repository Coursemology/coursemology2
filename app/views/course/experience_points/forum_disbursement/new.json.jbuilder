# frozen_string_literal: true

json.filters do
  json.startTime @disbursement.start_time
  json.endTime @disbursement.end_time
  json.weeklyCap @disbursement.weekly_cap
end

json.forumUsers @disbursement.experience_points_records do |record_fields|
  course_user = record_fields.course_user
  json.id course_user.id
  json.name course_user.name.strip
  json.level course_user.level_number
  json.exp course_user.experience_points
  json.postCount @disbursement.student_participation_statistics[course_user][:posts]
  json.voteTally @disbursement.student_participation_statistics[course_user][:votes]

  json.points record_fields.points_awarded
end
