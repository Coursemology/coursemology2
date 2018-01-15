# frozen_string_literal: true
json.id notification.id
json.notificationType 'levelReached'

level = notification.activity.object
json.levelNumber level.level_number
