# frozen_string_literal: true

json.partial! 'user_list_data', course_user: course_user

json.email course_user.user.email
json.role course_user.role
json.achievments course_user.achievements
json.achivementCount course_user.achievement_count

json.experiencePointsRecordsUrl course_user_experience_points_records_path(current_course, @course_user)
json.manageEmailSubscriptionUrl course_user_manage_email_subscription_path(current_course, @course_user)
