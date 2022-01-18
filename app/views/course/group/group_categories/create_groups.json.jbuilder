# frozen_string_literal: true
json.groups @created_groups do |group|
  json.partial! partial: 'group', group: group
end

json.failed @failed_groups do |group|
  json.partial! partial: 'group', group: group
end
