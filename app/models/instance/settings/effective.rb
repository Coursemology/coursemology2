class Instance::Settings::Effective < Instance::Settings
  include EffectiveSettingsConcern

  # @param [#settings] settings The settings object provided by the settings_on_rails gem.
  # @param component_host [#components] The component host for which to query settings for.
  def initialize(settings, component_host)
    super(settings)
    @component_host = component_host
  end
end
