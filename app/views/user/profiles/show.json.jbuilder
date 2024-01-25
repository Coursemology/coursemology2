# frozen_string_literal: true
json.id current_user.id
json.name current_user.name
json.imageUrl user_image(current_user)
json.primaryEmail current_user.email
