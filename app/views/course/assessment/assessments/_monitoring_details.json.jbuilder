# frozen_string_literal: true
json.monitoring do
  json.enabled @monitor.enabled
  json.min_interval_ms @monitor.min_interval_ms
  json.max_interval_ms @monitor.max_interval_ms
  json.offset_ms @monitor.offset_ms
  json.blocks @monitor.blocks
  json.browser_authorization @monitor.browser_authorization
  json.browser_authorization_method @monitor.browser_authorization_method
  json.secret @monitor.secret
  json.seb_config_key @monitor.seb_config_key
end
