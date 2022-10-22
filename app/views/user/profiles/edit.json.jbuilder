# frozen_string_literal: true

json.id current_user.id
json.name current_user.name
json.timezone current_user.time_zone
json.imageUrl user_image(current_user)
