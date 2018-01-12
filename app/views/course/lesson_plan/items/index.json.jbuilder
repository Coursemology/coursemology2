json.milestones @milestones, partial: 'course/lesson_plan/milestones/milestone.json.jbuilder', as: :milestone

json.items @items.map(&:specific) do |actable|
  json.partial! "#{actable.to_partial_path}_lesson_plan_item.json.jbuilder", item: actable
end

json.visibilitySettings @assessment_tabs_visibility_hash do |setting_key, visible|
  json.setting_key setting_key
  json.visible visible
end

json.flags do
  json.canManageLessonPlan can?(:manage, Course::LessonPlan::Item.new(course: current_course))
end
