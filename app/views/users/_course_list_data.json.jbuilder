# frozen_string_literal: true
course = course_user.course

json.id course.id
json.title course.title
json.courseUserName course_user.name
json.courseUserId course_user.user_id
json.courseUserRole course_user.role
json.courseUserLevel course_user.level_number
json.courseUserAchievement course_user.achievement_count
json.enrolledAt course_user.created_at
