# frozen_string_literal: true
json.array! controller.sidebar_items(type: :settings) do |option|
  json.title option[:title]
  json.id option[:key]
  json.weight option[:weight]
  json.path option[:path]
end
