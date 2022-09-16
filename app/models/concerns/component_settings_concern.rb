# frozen_string_literal: true
module ComponentSettingsConcern
  extend ActiveSupport::Concern

  # This is used when generating checkboxes for each of the components
  def disableable_component_collection
    @settable.disableable_components.map { |c| [c.display_name, c.key.to_s] }.sort
  end

  # Returns the ids of enabled components that can be disabled
  #
  # @return [Array<String>] The array which stores the ids, ids here are the keys of components
  def enabled_component_ids
    @enabled_component_ids ||= begin
      components = @settable.user_enabled_components - @settable.undisableable_components
      components.map { |c| c.key.to_s }
    end
  end

  # Disable/Enable components
  #
  # @param [Array<String>] ids the ids of all the enabled components
  # @return [Array<String>] the ids of all the enabled components
  def enabled_component_ids=(ids)
    @settable.enabled_components_keys = ids
  end
end
