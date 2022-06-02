# frozen_string_literal: true

json.usersPoints @course_users_points do |course_user|
  json.id course_user.id
  json.name format_inline_text(course_user.name)
  json.userLink course_user_path(current_course, course_user)
  json.userPicture user_image(course_user.user)
  json.level course_user.level_number
  json.experience course_user.experience_points
end

if @course_users_count.present?
  json.usersCount @course_users_count do |course_user|
    json.id course_user.id
    json.name format_inline_text(course_user.name)
    json.userLink course_user_path(current_course, course_user)
    json.userPicture user_image(course_user.user)
    json.achievementCount course_user.achievement_count
    json.achievements course_user.achievements.ordered_by_date_obtained.take(5).each do |achievement|
      json.id achievement.id
      json.name achievement.title
      json.link course_achievement_path(current_course, achievement)
      json.badge achievement_badge_path(achievement)
    end
  end
end

if @groups_points.present?
  json.groupPoints @groups_points do |group|
    json.id group.id
    json.name format_inline_text(group.name)
    json.averageExperiencePoints group.average_experience_points
    json.group group.course_users.includes(:user, :course).students.each do |course_user|
      json.id course_user.id
      json.name course_user.name
      json.userLink course_user_path(current_course, course_user)
      json.userPicture user_image(course_user.user)
    end
  end

  if @groups_count.present?
    json.groupCount @groups_count do |group|
      json.id group.id
      json.name format_inline_text(group.name)
      json.averageAchievementCount group.average_achievement_count
      json.group group.course_users.includes(:user, :course).students.each do |course_user|
        json.id course_user.id
        json.name course_user.name
        json.userLink course_user_path(current_course, course_user)
        json.userPicture user_image(course_user.user)
      end
    end
  end
end
