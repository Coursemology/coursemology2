# frozen_string_literal: true
json.matchedCount @summary[:matched_count]
json.newCount @summary[:new_count]
json.openToEveryone @summary[:open_to_everyone]

json.users @rows do |row|
  json.id row.user.id
  json.name row.user.name
  json.email row.user.email
  json.courseCount row.course_count
  json.instanceRole row.instance_role
  json.alreadyHasAccess row.already_has_access
  json.blocked row.blocked
end