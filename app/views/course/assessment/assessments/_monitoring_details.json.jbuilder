# frozen_string_literal: true
json.monitoring do
  json.enabled @monitor.enabled
  json.seb_hash @monitor.seb_hash
  json.min_interval_ms @monitor.min_interval_ms
  json.max_interval_ms @monitor.max_interval_ms
  json.offset_ms @monitor.offset_ms
end
