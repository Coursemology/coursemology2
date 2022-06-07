# frozen_string_literal: true

json.id achievement.id
json.title achievement.title
json.badge do
  json.name achievement[:badge]
  json.url achievement_badge_path(achievement)
end
