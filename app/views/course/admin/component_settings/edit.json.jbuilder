# frozen_string_literal: true
components = @settings.disableable_component_collection
enabled_components = @settings.enabled_component_ids.to_set

json.array! components do |component|
  id = component[1]
  json.id id
  json.displayName component[0]
  json.enabled enabled_components.include?(id)
end
