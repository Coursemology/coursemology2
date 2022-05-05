# frozen_string_literal: true

json.id achievement.id
json.title achievement.title
json.description achievement.description
json.badge do
  json.name achievement[:badge]
  if can?(:display_badge, achievement)
    json.url achievement_badge_path(achievement)
  else
    json.url image_path('achievement_locked.svg')
  end
end
json.weight achievement.weight
json.published achievement.published

json.achievementStatus achievement_status_class(achievement, current_course_user)

json.permissions do
  json.canAward can?(:award, achievement)
  json.canDelete can?(:delete, achievement)
  json.canDisplayBadge can?(:display_badge, achievement)
  json.canEdit can?(:edit, achievement)
  json.canManage can?(:manage, achievement)
end
