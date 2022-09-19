# frozen_string_literal: true
json.title @settings.title || ''
json.displayUserCount @settings.display_user_count.to_i
json.enableGroupLeaderboard @settings.enable_group_leaderboard
json.groupLeaderboardTitle @settings.group_leaderboard_title || ''
