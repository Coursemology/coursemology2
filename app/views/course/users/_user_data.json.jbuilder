# frozen_string_literal: true

json.partial! 'user_list_data', course_user: course_user

json.email course_user.user.email
json.role CourseUser.human_attribute_name(course_user.role)

if can?(:manage, Course::UserEmailUnsubscription.new(course_user: course_user))
  json.manageEmailSubscriptionUrl course_user_manage_email_subscription_path(current_course, @course_user)
end

can_read_progress = can?(:read, Course::ExperiencePointsRecord.new(course_user: course_user))
if can_read_progress
  json.experiencePointsRecordsUrl course_user_experience_points_records_path(current_course, @course_user)
  json.level course_user.level_number
  json.exp course_user.experience_points
end

unless current_component_host[:course_achievements_component].nil? && !current_course.gamified?
  json.achievementCount course_user.achievement_count if @course_user.student?
  json.achievements course_user.achievements if @course_user.student?
end

all_skill_branches = @skills_service.skill_branches
if can_read_progress && all_skill_branches.present?
  json.skillBranches all_skill_branches.each do |skill_branch|
    json.id skill_branch.id
    json.title skill_branch.title

    all_skills_in_branch = @skills_service.skills_in_branch(skill_branch)
    json.skills all_skills_in_branch&.each do |skill|
      json.id skill.id
      json.title skill.title
      json.percentage @skills_service.percentage_mastery(skill)
      json.grade @skills_service.grade(skill)
      json.totalGrade skill.total_grade
    end
  end
end
