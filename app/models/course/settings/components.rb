# frozen_string_literal: true
class Course::Settings::Components < Settings
  include ComponentSettingsConcern

  # Initialises the adapter to interface with the course component settings.
  #
  # @param [Course] course The course this component settings interface is for.
  # @param [#components] component_host The component host for which to query settings for.
  def initialize(course, component_host)
    super(course)
    @component_host = component_host
  end

  private

  # Array of components that are enabled for the course
  #
  # @return [Array<Class>] Array of enabled components
  def enabled_components
    @component_host.enabled_components
  end

  # Array of components that can be disabled for the course
  #
  # @return [Array<Class>] Array of disable-able components
  def disableable_components
    @component_host.course_disableable_components
  end
end
