# frozen_string_literal: true
json.rules @allowlist_rules do |rule|
  json.partial! 'rule', rule: rule
end
