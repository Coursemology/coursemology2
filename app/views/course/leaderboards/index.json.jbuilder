# frozen_string_literal: true

json.usersPoints @course_users_points do |course_user|
  json.user course_user.user
  json.name format_inline_text(course_user.name)
  json.userLink course_user_path(course_user, current_course)
  json.userPicture user_image(course_user.user)
  json.level course_user.level_number
  json.experience course_user.experience_points
end

if @course_users_count.present?
  json.usersCount @course_users_count do |course_user|
    json.user course_user.user
    json.name format_inline_text(course_user.name)
    json.userLink course_user_path(course_user, course_user.course)
    json.userPicture user_image(course_user.user)
    json.achievements course_user.achievements.ordered_by_date_obtained.take(5).each do |achievement|
      json.link course_achievement_path(current_course, achievement)
      json.badge achievement_badge_path(achievement)
    end
  end
end

# json.users @course_users.ordered_by_experience_points.take(display_user_count).each.with_index(1) do |course_user, index|
#   json.partial! 'achievement_list_data', achievement: achievement
#   json.conditions achievement.specific_conditions do |condition|
#     json.partial! 'course/condition/condition_list_data.json', condition: condition
#   end
# end

# json.permissions do
#   json.canCreate can?(:create, Course::Achievement.new(course: current_course))
#   json.canManage can?(:manage, @achievements.first)
#   json.canReorder can?(:reorder, Course::Achievement.new(course: current_course)) && @achievements.count > 1
# end
