# frozen_string_literal: true

json.id course_user.id
json.name course_user.name.strip

json.level course_user.level_number
json.exp course_user.experience_points
json.postCount @disbursement.student_participation_statistics[course_user][:posts]
json.voteTally @disbursement.student_participation_statistics[course_user][:votes]
