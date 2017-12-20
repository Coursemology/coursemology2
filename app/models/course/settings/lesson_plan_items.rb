# frozen_string_literal: true
#
# This model facilitates displaying and setting of lesson plan item settings.
#
# To add lesson plan item settings to a course component, ensure that these two methods
# are defined on the component's setting model
# (see {Course::ControllerComponentHost::Settings::ClassMethods#settings_class}):
#
# - `#lesson_plan_item_settings` - see {#lesson_plan_item_settings} for details
# - `#update_lesson_plan_item_setting` - see {#update} for details
#
# Lesson Plan Item settings are stored with the individual course components as all such items
# e.g. Surveys and Videos, act as lesson plan items.
#
class Course::Settings::LessonPlanItems
  def initialize(components)
    @components = components
  end

  # Consolidates lesson plan item settings from each course component.
  # Each setting item should be a hash in the format similar to the this example:
  # The setting item hash format might have to change when other components need item settings.
  #
  # ```
  # {
  #   component: :course_assessments_component, # Component key
  #   category_title: 'Category title',         # For display
  #   enabled: true,                # The user's setting, otherwise, the default setting
  #   tab_title: 'Quests',          # For display
  #   options: { category_id: 5, tab_id: 145 },  # Other info for the setting
  # }
  # ```
  #
  # @return [Array<Hash>] Array of setting items
  def lesson_plan_item_settings
    all_settings = settings_interfaces_hash.values.map do |settings|
      settings.respond_to?(:lesson_plan_item_settings) ? settings.lesson_plan_item_settings : nil
    end
    all_settings.compact.flatten.sort_by { |item| item[:component] }
  end

  # Updates a single lesson plan item setting.
  # It delegates the updating to the appropriate settings model.
  # The attributes hash is expected to have the following shape:
  #
  # ```
  # {
  #   'component' => 'course_assessments_component', # Component key
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
    settings_interface.update_lesson_plan_item_setting(attributes)
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
