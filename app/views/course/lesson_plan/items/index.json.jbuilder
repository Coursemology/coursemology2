json.milestones do
  json.array! @milestones, partial: 'course/lesson_plan/milestones/milestone.json.jbuilder', as: :milestone
end

json.items do
  json.array! @items.map(&:specific) do |actable|
    json.partial! "#{actable.to_partial_path}_lesson_plan_item.json.jbuilder", item: actable
  end
end
