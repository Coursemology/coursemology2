# frozen_string_literal: true
#
# This serves as a base class for course settings models that are need settings
# from more than 1 course component.
#
class Course::Settings::PanComponent < SimpleDelegator
  include ActiveModel::Validations

  def initialize(components)
    @components = components
    super
  end

  # Calls the given function from the component settings which respond to the function.
  # Each function returns settings stored in its respective component.
  #
  # @param [Symbol] function_name The name of the function to be called.
  def consolidate_settings_from_components(function_name)
    all_settings = settings_interfaces_hash.values.map do |settings|
      settings.respond_to?(function_name) ? settings.public_send(function_name) : nil
    end
    all_settings.compact.flatten.sort_by { |item| item[:component] }
  end

  # Calls the given function for updating a setting.
  # The component key of the component which has the function should be passed in the
  # attributes hash.
  #
  # @param [Symbol] function_name The name of the function in the Course::Settings::Component
  #   class which will update the desired setting.
  # @param [Hash] attributes
  def update_setting_in_component(function_name, attributes)
    settings_interface = settings_interfaces_hash[attributes['component']]
    return false unless settings_interface

    settings_interface.send(function_name, attributes)
  end

  private

  # Maps component keys to component setting model instances.
  #
  # @return [Hash{String => Object}]
  def settings_interfaces_hash
    @settings_interfaces_hash ||= @components.map do |component|
      settings = component.settings
      settings && [component.key.to_s, settings]
    end.compact.to_h
  end
end
