# frozen_string_literal: true
json.id notification.id
json.notificationType 'achievementGained'

achievement = notification.activity.object
json.badgeUrl achievement_badge_path(achievement)
json.title format_ckeditor_rich_text(achievement.title)
json.description format_ckeditor_rich_text(achievement.description)
