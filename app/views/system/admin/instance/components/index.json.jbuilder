# frozen_string_literal: true
components = @settings.disableable_component_collection
enabled_components = @settings.enabled_component_ids.to_set

json.components do
  json.array! components do |component|
    json.key component[1]
    json.displayName component[0]
    json.enabled enabled_components.include?(component[1])
  end
end
