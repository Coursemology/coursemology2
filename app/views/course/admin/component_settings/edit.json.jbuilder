# frozen_string_literal: true
components = @settings.disableable_component_collection
enabled_components = @settings.enabled_component_ids.to_set

json.array! components do |id|
  json.id id
  json.enabled enabled_components.include?(id)
end
