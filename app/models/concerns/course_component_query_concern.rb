# frozen_string_literal: true
#
# This concern provides methods to query which course components are set as enabled/disabled
# for the models in which they are included (e.g. Course, Instance).
#
# The core functionality that this concern provides is the logic to reconcile:
#   1. Settings specified by users who are managers at the current level (e.g. course or instance level).
#   2. Settings implicitly casacaded down (via `available_components`) from a parent model, if any.
#   3. Settings that are hard-coded within the component.
#
# It expects the models to have a `settings_on_rails` `settings` column and
# also provides methods to persist course component settings for them.
module CourseComponentQueryConcern
  extend ActiveSupport::Concern

  # @return [Array<Class>] The classes of the components that are available
  def available_components
    raise NotImplementedError, 'Concrete concern must implement available_components'
  end

  # @return [Array<Class>] The subset of available_components that the user can disable.
  def disableable_components
    raise NotImplementedError, 'Concrete concern must implement disableable_components'
  end

  def undisableable_components
    @undisableable_components ||= available_components - disableable_components
  end

  # Applies user preferences to components that can be disabled.
  #
  # @return [Array<Class>] Array of components that are effectively enabled.
  def enabled_components
    @enabled_components ||= undisableable_components | user_enabled_components
  end

  # @return [Array<Class>] Components specified as 'enabled' by the user.
  def user_enabled_components
    @user_enabled_components ||= available_components.select do |component|
      enabled = component_setting(component.key).enabled
      enabled.nil? ? component.enabled_by_default? : enabled
    end
  end

  # Set component's `enabled` key only if it is disableable
  def set_component_enabled_boolean(key, value)
    validate_settable_component_keys!([key])
    unsafe_set_component_enabled_boolean(key, value)
  end

  # Sets and saves component's `enabled` key
  def set_component_enabled_boolean!(key, value)
    set_component_enabled_boolean(key, value)
    save!
  end

  # Updates the list of enabled components given a list of key.
  #
  # @param [Array<Symbol|String>] keys
  def enabled_components_keys=(keys)
    keys = keys.reject(&:blank?).map(&:to_sym)
    validate_settable_component_keys!(keys)
    disableable_components.each do |component|
      unsafe_set_component_enabled_boolean(component.key, keys.include?(component.key))
    end
  end

  private

  # Specify which subtree settings for component should be stored under.
  def component_setting(key)
    settings(:components, key)
  end

  # Set component's `enabled` key to be either true or false.
  #
  # @param [Symbol|String] key Component key
  # @param [Boolean] value true if component is to be enabled, false otherwise.
  def unsafe_set_component_enabled_boolean(key, value)
    component_setting(key).enabled = value
  end

  # @param [Array<Symbol>] keys
  def validate_settable_component_keys!(keys)
    allowed_keys = disableable_components.map(&:key)
    return if keys.to_set.subset?(allowed_keys.to_set)

    raise ArgumentError, "Invalid component keys: #{keys - allowed_keys}."
  end
end
