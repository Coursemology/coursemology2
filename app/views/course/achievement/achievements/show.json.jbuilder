# frozen_string_literal: true

json.achievement do
  json.partial! 'achievement_data', achievement: @achievement, achievement_users: @achievement_users
  json.partial! 'course/condition/condition_data', conditional: @achievement
end
