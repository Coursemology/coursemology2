# frozen_string_literal: true
json.users @instance_users.each do |instance_user|
  json.partial! 'user_list_data', instance_user: instance_user
end

json.counts do
  json.totalUsers do
    json.adminCount @counts[:total][:administrator]
    json.instructorCount @counts[:total][:instructor]
    json.normalCount @counts[:total][:normal]
    json.allCount @counts[:total].values.sum
  end
  json.activeUsers do
    json.adminCount @counts[:active][:administrator]
    json.instructorCount @counts[:active][:instructor]
    json.normalCount @counts[:active][:normal]
    json.allCount @counts[:active].values.sum
  end
  json.usersCount @instance_users_count
end
