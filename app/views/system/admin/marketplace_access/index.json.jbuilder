# frozen_string_literal: true
json.users @rows do |row|
  json.id row.user.id
  json.name row.user.name
  json.email row.user.email
  json.courseCount row.course_count
  json.instanceRole row.instance_role
  json.allowedByRules row.allowed_by_rules do |rule|
    json.id rule.id
    json.ruleType rule.rule_type
    json.labelValue marketplace_rule_label_value(rule)
  end
  json.systemAdmin row.system_admin?
  json.blocked row.blocked?
  json.blockId row.block_id
end

json.summary do
  json.totalWithAccess @summary[:total_with_access]
  json.totalBlocked @summary[:total_blocked]
  json.openToEveryone @summary[:open_to_everyone]
end
