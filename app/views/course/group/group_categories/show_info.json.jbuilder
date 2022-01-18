# frozen_string_literal: true
json.groupCategory @group_category

json.groups @groups do |group|
  json.partial! partial: 'group', group: group
end
