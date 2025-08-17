# frozen_string_literal: true

json.id user.id
json.name user.name
json.email user.email

courses_by_instance = course_users.group_by { |cu| cu.course.instance_id }
json.instances @instances_preload_service.instances_for(user.id)&.each do |instance|
  json.name instance.name
  json.host instance.host
  json.courses courses_by_instance.fetch(instance.id, []) do |course_user|
    json.id course_user.course.id
    json.title course_user.course.title
  end
end
json.role user.role
