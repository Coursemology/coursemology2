# frozen_string_literal: true
#
# This model facilitates displaying and setting of notification settings.
#
# To add email notification settings to a course component, ensure that these two methods
# are defined on the component's setting model
# (see {Course::ControllerComponentHost::Settings::ClassMethods#settings_class}):
#
# - `#email_settings` - see {#email_settings} for details
# - `#update_email_setting` - see {#update} for details
#
class Course::Settings::Notifications
  def initialize(components)
    @components = components
  end

  # Consolidates email settings from each course component.
  # Each setting item should be a hash in the format similar to the this example:
  #
  # ```
  # {
  #   component: :course_assessments_component, # Component key
  #   key: :new_assignment,         # Email setting key
  #   enabled: true,                # The user's setting, otherwise, the default setting
  #   component_title: 'Quests',    # [Optional] Title to be displayed as the (sub)component's name
  #   options: { category_id: 5 },  # [Optional] Other info for the setting
  # }
  # ```
  #
  # @return [Array<Hash>] Array of setting items
  def email_settings
    all_settings = settings_interfaces_hash.values.map do |settings|
      settings.respond_to?(:email_settings) ? settings.email_settings : nil
    end
    all_settings.compact.flatten.sort_by { |item| item[:component] }
  end

  # Updates a single email setting. It delegates the updating to the appropriate settings model.
  # The attributes hash is expected to have the following shape:
  #
  # ```
  # {
  #   'component' => 'course_assessments_component', # Component key
  #   'key' => 'new_assignment',           # Email setting key
  #   'enabled' => false,                  # The new setting
  #   'options' => { 'category_id' => 5 }, # [Optional] Other info for the setting
  # }
  # ```
  #
  # @param [Hash] attributes
  # @return [Boolean] true if updating succeeds, false otherwise
  def update(attributes)
    settings_interface = settings_interfaces_hash[attributes['component']]
    return false unless settings_interface
    settings_interface.update_email_setting(attributes)
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
