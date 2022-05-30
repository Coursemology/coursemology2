# frozen_string_literal: true

json.users @course_users.ordered_by_experience_points.take(display_user_count).each.with_index(1) do |course_user, index|
  json.partial! 'achievement_list_data', achievement: achievement
  json.conditions achievement.specific_conditions do |condition|
    json.partial! 'course/condition/condition_list_data.json', condition: condition
  end
end

json.permissions do
  json.canCreate can?(:create, Course::Achievement.new(course: current_course))
  json.canManage can?(:manage, @achievements.first)
  json.canReorder can?(:reorder, Course::Achievement.new(course: current_course)) && @achievements.count > 1
end
