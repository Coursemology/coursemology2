# frozen_string_literal: true

json.partial! 'achievement_list_data', achievement: achievement

json.achievementUsers achievement_users do |course_user|
  json.id course_user.id
  json.name course_user.name.strip
  json.imageUrl user_image(course_user.user)
end
