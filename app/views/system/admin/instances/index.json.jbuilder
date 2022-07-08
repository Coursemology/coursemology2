# frozen_string_literal: true
json.instances @instances.each do |instance|
  json.partial! 'instance_list_data', instance: instance
end

json.permissions do
  json.canCreate can?(:create, Instance.new)
end

json.counts @instances_count
