# frozen_string_literal: true
json.array! items do |item|
  json.key item[:key]
  json.label item[:title]
  json.path item[:path]
  json.icon item[:icon]
  json.unread item[:unread] if item[:unread]&.nonzero?
  json.exact item[:exact].presence
end
