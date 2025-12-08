# frozen_string_literal: true
components = @settings.disableable_component_collection
enabled_components = @settings.enabled_component_ids.to_set

json.components do
  json.array! components do |component|
    json.key component
    json.enabled enabled_components.include?(component)
  end
end
