# Provides an adapter for configuration settings as a resource for use with controllers and views.
class Instance::Settings
  include ActiveModel::Model
  include ActiveModel::Conversion

  attr_accessor :errors

  # Initialises the settings adapter
  #
  # @param settings [#settings] The settings object provided by the settings_on_rails gem.
  def initialize(settings)
    @settings = settings
  end

  # Update settings with the hash attributes
  #
  # @param attributes [Hash] The hash who stores the new settings
  def update(attributes)
    attributes.each { |k, v| send("#{k}=", v) }
    true
  end

  def persisted? #:nodoc:
    true
  end

  # Returns all the enabled components
  #
  # @return [Array<Boolean>] The array who stores the enabled statuses of components
  def enabled_components
    components_enabled_statuses.select(&:value)
  end

  # Returns the ids of all the enabled components
  #
  # @return [Array<String>] The array who stores the ids, ids here are the keys of components
  def enabled_component_ids
    enabled_components.map(&:id)
  end

  # Disable/Enable components
  #
  # @param [Array<String>] ids the ids of all the enabled components
  def enabled_component_ids=(ids)
    components_to_disable, components_to_enable = deduce_component_ids(ids)

    component_settings = settings(:components)
    components_to_enable.each { |c| component_settings.settings(c).enabled = true }
    components_to_disable.each { |c| component_settings.settings(c).enabled = false }
  end

  private

  # Queries the underlying settings object for the key's subtree.
  #
  # @param symbol [Symbol] The symbol to query for.
  def settings(symbol)
    @settings.settings(symbol)
  end

  # Gets the enabled status for every component which has a settings key.
  #
  # @return [Array<Instance::Settings::BooleanValue>]
  def components_enabled_statuses
    component_settings = settings(:components)
    component_settings.map do |k, v|
      enabled = v[:enabled].nil? ? false : v[:enabled]
      Instance::Settings::BooleanValue.new(id: k, value: enabled)
    end || []
  end

  # Deduces the components to disable/enable from the set of IDs which are enabled.
  #
  # @param ids [Array<String>] The set of component IDs to enable.
  # @return [Set<String>, Set<String>] The components which are to be disabled and the set of
  #                                    components which are to be enabled respectively.
  def deduce_component_ids(ids)
    components_to_disable = Set[*components_enabled_statuses.map(&:id)]
    components_to_enable = Set.new

    ids.each do |id|
      next if id.empty?
      components_to_disable.delete(id)
      components_to_enable << id
    end

    [components_to_disable, components_to_enable]
  end
end
