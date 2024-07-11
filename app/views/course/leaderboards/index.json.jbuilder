# frozen_string_literal: true

json.leaderboardTitle @settings.title || ''
json.leaderboardByExpPoints @course_users_points do |course_user|
  json.partial! 'leaderboard_list_data', course_user: course_user
  json.level course_user.level_number
  json.experience course_user.experience_points
end

if @course_users_count.present?
  json.leaderboardByAchievementCount @course_users_count do |course_user|
    json.partial! 'leaderboard_list_data', course_user: course_user
    json.achievementCount course_user.achievement_count
    json.achievements course_user.achievements.ordered_by_date_obtained.take(5).each do |achievement|
      json.partial! 'leaderboard_achievement_list_data', achievement: achievement
    end
  end
end

if @groups_points.present?
  json.groupleaderboardTitle @settings.group_leaderboard_title || ''
  json.groupleaderboardByExpPoints @groups_points do |group|
    json.partial! 'leaderboard_group_list_data', group: group
    json.averageExperiencePoints group.average_experience_points
    json.group group.course_users.includes(:user, :course).students.each do |course_user|
      json.partial! 'leaderboard_list_data', course_user: course_user
    end
  end

  if @groups_count.present?
    json.groupleaderboardByAchievementCount @groups_count do |group|
      json.partial! 'leaderboard_group_list_data', group: group
      json.averageAchievementCount group.average_achievement_count
      json.group group.course_users.includes(:user, :course).students.each do |course_user|
        json.partial! 'leaderboard_list_data', course_user: course_user
      end
    end
  end
end
