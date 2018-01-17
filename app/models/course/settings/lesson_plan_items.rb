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
class Course::Settings::LessonPlanItems < Course::Settings::PanComponent
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
    consolidate_settings_from_components(:lesson_plan_item_settings)
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
    update_setting_in_component(:update_lesson_plan_item_setting, attributes)
  end

  # Gets a hash of actable type names for lesson plan items of enabled components mapped to data
  # that will be passed to actable's model scope for further processing.
  #
  # @return [Hash{String => Array or nil}] Hash of actable_type names to data.
  def actable_hash
    lesson_plan_item_actable_names.map do |actable_name|
      actable_hash_data(actable_name)
    end.compact.to_h
  end

  private

  def lesson_plan_item_actable_names
    @components.map(&:class).map(&:lesson_plan_item_actable_names).flatten
  end

  # Gets the data needed for actable_hash from each component's settings_interface.
  #
  # For Assessments, return the tab IDs which are disabled.
  #
  # For Survey and Video where the setting is all or nothing, return nil if they're not supposed to
  # be shown so the key isn't even in actable_hash. This is the same mechanism used to prevent items
  # belonging to disabled components from showing in the lesson plan.
  #
  # @param [String] actable_name The name of the actable type.
  # @return [Array<String> or nil]
  def actable_hash_data(actable_name)
    case actable_name
    when Course::Assessment.name
      [actable_name, settings_interfaces_hash['course_assessments_component'].disabled_tab_ids_for_lesson_plan]
    when Course::Survey.name
      [actable_name, nil] if settings_interfaces_hash['course_survey_component'].showable_in_lesson_plan?
    when Course::Video.name
      [actable_name, nil] if settings_interfaces_hash['course_videos_component'].showable_in_lesson_plan?
    when Course::LessonPlan::Event.name
      [actable_name, nil]
    end
  end
end
