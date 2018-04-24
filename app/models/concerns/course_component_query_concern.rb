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

  private

  # Specify which subtree settings for component should be stored under.
  def component_setting(key)
    settings(:components, key)
  end
end
