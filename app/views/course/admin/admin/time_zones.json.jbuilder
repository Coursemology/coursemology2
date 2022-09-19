# frozen_string_literal: true
json.array! ActiveSupport::TimeZone.all do |time_zone|
  json.name time_zone.name
  json.displayName "(GMT#{time_zone.formatted_offset}) #{time_zone.name}"
end
