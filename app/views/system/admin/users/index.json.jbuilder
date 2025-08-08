# frozen_string_literal: true
json.users @users.each do |user|
  json.partial! 'user_list_data', user: user, course_users: @user_course_hash.fetch(user.id, [])
end

json.counts do
  json.totalUsers do
    json.adminCount @counts[:total][:administrator]
    json.normalCount @counts[:total][:normal]
    json.allCount @counts[:total].values.sum
  end
  json.activeUsers do
    json.adminCount @counts[:active][:administrator]
    json.normalCount @counts[:active][:normal]
    json.allCount @counts[:active].values.sum
  end
  json.usersCount @users_count
end
