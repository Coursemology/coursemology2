module ModuleHostSettingsConcern
  extend ActiveSupport::Concern

  included do
    has_settings_on :settings

    after_initialize :set_default_settings, if: :new_record?
  end

  # Apply preferences to all the modules, returns the enabled modules.
  #
  # @return [Array] array of enabled modules
  def enabled_modules
    modules.select do |m|
      enabled = settings(m.key).enabled
      enabled.nil? ? m.enabled_by_default? : enabled
    end
  end

  # Apply preferences to all the modules, returns the disabled modules.
  #
  # @return [Array] array of disabled modules
  def disabled_modules
    modules - enabled_modules
  end

  private

  # Set settings to the defaults
  def set_default_settings
    modules.map do |m|
      settings(m.key).enabled = m.enabled_by_default?
    end
  end
end
