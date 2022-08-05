# frozen_string_literal: true
components = @settings.disableable_component_collection.group_by do |c|
  @settings.enabled_component_ids.include?(c[:key]) ? :enabled : :disabled
end

json.components components
