# frozen_string_literal: true
json.id notification.id
json.notificationType 'achievementGained'

achievement = notification.activity.object
json.badgeUrl achievement.badge.url
json.title format_html(achievement.title)
json.description format_html(achievement.description)
