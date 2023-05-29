# frozen_string_literal: true
levels_enabled = !current_component_host[:course_levels_component].nil?
achievements_enabled = !current_component_host[:course_achievements_component].nil?

if levels_enabled
  json.level course_user.level_number
  json.nextLevelPercentage course_user.level_progress_percentage

  experience_points = course_user.experience_points
  json.exp experience_points

  next_threshold = course_user.next_level_threshold
  difference = next_threshold - experience_points
  json.nextLevelExpDelta difference > 0 ? difference : 'max'
end

if achievements_enabled
  recent_achievements = course_user.achievements.recently_obtained(5)

  json.recentAchievements do
    json.partial! 'course/assessment/assessments/achievement_badges',
                  achievements: recent_achievements,
                  course: course_user.course
  end

  json.remainingAchievementsCount course_user.achievement_count - recent_achievements.size
end
