# frozen_string_literal: true

json.personalTimes @items.each do |item|
  # The followings are duplicate from _personal_time_list_data
  # We are not using _personal_time_list_data as nested jbuilder compromises
  # the performance. When changing the following, need to ensure that
  # _personal_time_list_data is also changed.
  personal_time = item.find_or_create_personal_time_for(@course_user)

  json.id personal_time.lesson_plan_item_id
  json.personalTimeId personal_time.id
  json.actableId item.actable_id
  json.type item.actable_type
  json.title item.title
  json.itemStartAt item.reference_time_for(@course_user).start_at
  json.itemBonusEndAt item.reference_time_for(@course_user).bonus_end_at
  json.itemEndAt item.reference_time_for(@course_user).end_at

  json.personalStartAt personal_time.start_at || nil
  json.personalBonusEndAt personal_time.bonus_end_at || nil
  json.personalEndAt personal_time.end_at || nil

  json.fixed personal_time.fixed
  json.new personal_time.new_record?
end
