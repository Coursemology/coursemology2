# frozen_string_literal: true
sorted_sidebar_items = @settings.sidebar_items.sort_by(&:weight)

json.array! sorted_sidebar_items do |item|
  json.id item.id
  json.title item.title
  json.weight item.weight
  json.icon item.icon
end
