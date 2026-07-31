# frozen_string_literal: true
json.array! items do |item|
  json.key item[:key]
  json.label item[:title]
  json.icon item[:icon]
  if link_items
    json.path item[:path]
    json.unread item[:unread] if item[:unread]&.nonzero?
  end
  json.exact item[:exact].presence
end
