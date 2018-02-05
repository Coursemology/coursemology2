# frozen_string_literal: true
json.id notification.id
json.notificationType 'levelReached'

level = notification.activity.object
json.levelNumber level.level_number

leaderboard_component = current_component_host[:course_leaderboard_component]
if leaderboard_component.present?
  display_user_count = leaderboard_component.settings.display_user_count

  json.leaderboardEnabled true
  json.leaderboardPosition leaderboard_position(current_course, current_course_user, display_user_count)
else
  json.leaderboardEnabled false
  json.leaderboardPosition nil
end
