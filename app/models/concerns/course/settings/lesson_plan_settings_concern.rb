# frozen_string_literal: true
#
# This concern provides common defaults for querying and persisting lesson plan item settings
# for a course component. It abstracts out common code for components which only need their items
# fully enabled or disabled in the lesson plan.
#
# For more complicated settings, look at how assessment lesson plan settings are implemented.
#
# The lesson plan item settings for the given component is assumed to be stored in the following
# shape in course.settings:
#
#  {
#    course_component_key: {
#      lesson_plan_items: {
#         enabled: true,
#         visible: false,
#      }
#    }
#  }
#
# To use this concern:
#   - Include the concern in the settings model for the component.
#   - Implement `#lesson_plan_setting_items` if additional attributes are needed in the hash.
#
module Course::Settings::LessonPlanSettingsConcern
  extend ActiveSupport::Concern

  # A hash of concrete lesson plan settings for the component. This is used by
  # {Course::Settings::LessonPlanItems} for the lesson plan settings page.
  # See {Course::Settings::LessonPlanItems#lesson_plan_item_settings} for details of the hash shape.
  #
  # @return [Hash] Setting hash for a component.
  def lesson_plan_item_settings
    enabled_setting = settings.settings(:lesson_plan_items).enabled
    visible_setting = settings.settings(:lesson_plan_items).visible
    {
      component: key,
      enabled: enabled_setting.nil? ? true : enabled_setting,
      visible: visible_setting.nil? ? true : visible_setting
    }
  end

  # Updates a lesson plan item setting.
  #
  # @param [Hash] attributes New setting represented by a hash with
  #  `'component'`, `'enabled'` and `'visible'` keys,
  #  e.g. { 'component' => 'course_survey_component', 'enabled' => true, 'visible' => true }
  def update_lesson_plan_item_setting(attributes)
    settings.settings(:lesson_plan_items).enabled = ActiveRecord::Type::Boolean.new.
                                                    cast(attributes['enabled'])
    settings.settings(:lesson_plan_items).visible = ActiveRecord::Type::Boolean.new.
                                                    cast(attributes['visible'])
    true
  end

  def showable_in_lesson_plan?
    settings.lesson_plan_items ? settings.lesson_plan_items['enabled'] : true
  end
end
