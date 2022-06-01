# frozen_string_literal: true

json.partial! 'user_list_data', course_user: course_user

json.email course_user.user.email
json.role CourseUser.human_attribute_name(course_user.role)

can_read_progress = can?(:read, Course::ExperiencePointsRecord.new(course_user: course_user))
if can_read_progress
  json.experiencePointsRecordsUrl course_user_experience_points_records_path(current_course, @course_user)
  json.level course_user.level_number
  json.exp course_user.experience_points
end

if can?(:manage, Course::UserEmailUnsubscription.new(course_user: course_user))
  json.manageEmailSubscriptionUrl course_user_manage_email_subscription_path(current_course, @course_user)
end

unless current_component_host[:course_achievements_component].nil?
  json.achivementCount course_user.achievement_count if @course_user.student? && current_course.gamified?
  json.achievments course_user.achievements if @course_user.student? && @course_user.achievements.present?
end

all_skill_branches = @skills_service.skill_branches
json.skills all_skill_branches if can_read_progress && all_skill_branches.present?
# json.skills all_skill_branches.each do |skill_branch|
# json.skillBranchTitle skill_branch.title
