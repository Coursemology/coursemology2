# frozen_string_literal: true
json.array! achievements do |achievement|
  json.url course_achievement_path(course, achievement)
  json.badgeUrl achievement_badge_path(achievement)
  json.title achievement.title
end
