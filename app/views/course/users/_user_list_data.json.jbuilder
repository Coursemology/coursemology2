# frozen_string_literal: true

json.id course_user.id
json.name course_user.name.strip
json.imageUrl user_image(course_user.user)

json.permissions do
  # json.canManage can?(:manage, achievement)
end
