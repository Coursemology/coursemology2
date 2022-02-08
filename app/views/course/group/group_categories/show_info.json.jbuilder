# frozen_string_literal: true
json.groupCategory @group_category

json.groups @groups do |group|
  json.partial! partial: 'course/group/group', group: group
end

json.canManageCategory @can_manage_category
json.canManageGroups @can_manage_groups
