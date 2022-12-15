# frozen_string_literal: true
json.id reference_timeline.id
json.title reference_timeline.title
json.weight reference_timeline.weight

if render_times
  reference_times = reference_timeline.reference_times.includes(:lesson_plan_item)
  json.times reference_times do |time|
    json.id time.id
    json.startAt time.start_at
    json.bonusEndAt time.bonus_end_at if time.bonus_end_at.present?
    json.endAt time.end_at if time.end_at.present?

    item = time.lesson_plan_item
    json.itemId item.id
    json.actableId item.actable_id
    json.type item.actable_type.constantize.model_name.human
    json.title item.title
  end
end
