# frozen_string_literal: true

json.id user.id
json.name user.name
json.email user.email
json.instances @instances_preload_service.instances_for(user.id)&.each do |instance|
  json.name instance.name
  json.host instance.host
end
json.role user.role
