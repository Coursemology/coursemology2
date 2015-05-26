class Course::Settings
  include SettingsConcern

  # Initialises the settings adapter
  #
  # @param [#settings] settings The settings object provided by the settings_on_rails gem.
  def initialize(settings)
    @settings = settings
  end

  # Update settings with the hash attributes
  #
  # @param [Hash] attributes The hash who stores the new settings
  def update(attributes)
    attributes.each { |k, v| send("#{k}=", v) }
    true
  end

  def persisted? #:nodoc:
    true
  end
end
