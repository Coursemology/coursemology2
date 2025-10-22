# frozen_string_literal: true
json.partial! 'user_list_data', course_user: course_user, should_show_timeline: should_show_timeline

is_student_and_gamified = current_course.gamified? && course_user.student?
can_read_progress = can?(:read, Course::ExperiencePointsRecord.new(course_user: course_user)) &&
                    current_course.component_enabled?(Course::ExperiencePointsComponent)
can_read_statistics = can?(:read_statistics, current_course) &&
                      current_course.component_enabled?(Course::StatisticsComponent)

if can_read_progress && is_student_and_gamified
  json.experiencePointsRecordsUrl course_user_experience_points_records_path(current_course, @course_user)
  json.level course_user.level_number
  json.exp course_user.experience_points
end

unless current_component_host[:course_achievements_component].nil? || !is_student_and_gamified
  json.achievements course_user.achievements.each do |achievement|
    json.id achievement.id
    json.title achievement.title
    json.badge achievement.badge
  end
end

all_skill_branches = @skills_service.skill_branches
can_view_skills = all_skill_branches.present? && can_read_progress

if can_view_skills
  json.skillBranches all_skill_branches.each do |skill_branch|
    json.partial! 'course/assessment/skill_branches/skill_branch_user_list_data', skill_branch: skill_branch
  end
end

if @learning_rate_record.present?
  json.learningRate @learning_rate_record.learning_rate
  json.learningRateEffectiveMin @learning_rate_record.effective_min
  json.learningRateEffectiveMax @learning_rate_record.effective_max
end

json.canReadStatistics can_read_statistics
