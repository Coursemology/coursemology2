# frozen_string_literal: true
class Settings
  include ActiveModel::Model
  include ActiveModel::Conversion
  include ActiveModel::Validations

  # Initialises the settings adapter
  #
  # @param [#settable] settable The settable object that has settings_on_rails settings.
  def initialize(settable)
    @settable = settable
  end

  # Update settings with the hash attributes
  #
  # @param [Hash] attributes The hash who stores the new settings
  def update(attributes)
    attributes.each { |k, v| send("#{k}=", v) }
    valid?
  end

  # This causes forms for settings to be submitted using PATCH instead of POST
  def persisted?
    true
  end

  private

  # By default, save settings at the root of the tree
  def settings
    @settable.settings
  end
end
