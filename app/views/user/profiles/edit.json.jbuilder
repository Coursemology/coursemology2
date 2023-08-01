# frozen_string_literal: true

json.id current_user.id
json.name current_user.name
json.timeZone user_time_zone
json.locale I18n.locale
json.imageUrl user_image(current_user)
json.availableLocales I18n.available_locales
