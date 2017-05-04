# frozen_string_literal: true
class Instance::Settings::Components < Settings
  include ComponentSettingsConcern

  private

  # Array of components that are enabled for the instance
  #
  # @return [Array<Class>] Array of enabled components
  def enabled_components
    Course::ControllerComponentHost.find_enabled_components(disableable_components, settings)
  end

  # Array of components that can be disabled for the instance
  #
  # @return [Array<Class>] Array of disable-able components
  def disableable_components
    Course::ControllerComponentHost.disableable_components
  end
end
