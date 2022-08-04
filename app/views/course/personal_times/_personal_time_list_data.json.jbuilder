# frozen_string_literal: true
# When changing the following, need to ensure that
# personal_times/index is also changed.

personal_time = item.find_or_create_personal_time_for(@course_user)

json.id personal_time.lesson_plan_item_id
json.personalTimeId personal_time.id
json.actableId item.actable_id
json.type item.actable_type
json.title item.title
if item.reference_time_for(@course_user).start_at.nil?
  json.itemStartAt nil
else
  json.itemStartAt format_datetime(item.reference_time_for(@course_user).start_at, :short)
end
if item.reference_time_for(@course_user).bonus_end_at.nil?
  json.itemBonusEndAt nil
else
  json.itemBonusEndAt format_datetime(item.reference_time_for(@course_user).bonus_end_at, :short)
end
if item.reference_time_for(@course_user).end_at.nil?
  json.itemEndAt nil
else
  json.itemEndAt format_datetime(item.reference_time_for(@course_user).end_at, :short)
end

json.personalStartAt personal_time.start_at || nil
json.personalBonusEndAt personal_time.bonus_end_at || nil
json.personalEndAt personal_time.end_at || nil

json.fixed personal_time.fixed
json.new personal_time.new_record?
