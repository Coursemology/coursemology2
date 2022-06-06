# frozen_string_literal: true

json.id achievement.id
json.title achievement.title
json.badge do
  json.name achievement[:badge]
  if can?(:display_badge, achievement)
    json.url achievement_badge_path(achievement)
  else
    json.url image_path('achievement_locked.svg')
  end
end
