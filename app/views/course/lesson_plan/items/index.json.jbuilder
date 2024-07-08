# frozen_string_literal: true
json.milestones @milestones do |milestone|
  json.partial! 'course/lesson_plan/milestones/milestone', milestone: milestone
end

json.items @items.map(&:specific) do |actable|
  json.partial! "#{actable.to_partial_path}_lesson_plan_item", item: actable
end

json.visibilitySettings @visibility_hash do |setting_key, visible|
  json.setting_key setting_key
  json.visible visible
end

json.flags do
  json.canManageLessonPlan can?(:manage, Course::LessonPlan::Item.new(course: current_course))
  json.milestonesExpanded @settings.milestones_expanded
end
