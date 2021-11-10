# frozen_string_literal: true
class Course::Settings::AssessmentsComponent < Course::Settings::Component
  class << self

    # Do not add this to a destroy callback in the Tab model as it will get invoked when
    # the course is being destroyed and saving of the course here to save the settings
    # will cause the course deletion to fail.
    #
    # @param [Course] current_course The current course, to get the settings object.
    # @param [Integer] tab_id The tab ID of the lesson plan item setting to be cleared.
    def delete_lesson_plan_item_setting(current_course, tab_id)
      current_course.settings(Course::AssessmentsComponent.key, :lesson_plan_items).
        public_send("tab_#{tab_id}=", nil)
      current_course.save
    end
  end

  # Generates a list of concrete lesson plan item settings for use on the lesson plan settings page.
  # Currently returns settings for assessment tabs.
  #
  # @return [Array<Hash>]
  def lesson_plan_item_settings
    current_course.assessment_categories.map do |category|
      category.tabs.map do |tab|
        lesson_plan_item_setting_hash(key, tab.category, tab)
      end
    end
  end

  def update_lesson_plan_item_setting(attributes)
    tab_id = attributes['options']['tab_id']
    settings.settings(:lesson_plan_items, "tab_#{tab_id}").enabled = ActiveRecord::Type::Boolean.new.
                                                                     cast(attributes['enabled'])
    settings.settings(:lesson_plan_items, "tab_#{tab_id}").visible = ActiveRecord::Type::Boolean.new.
                                                                     cast(attributes['visible'])
    true
  end

  def disabled_tab_ids_for_lesson_plan
    disabled_tab_keys = []
    lesson_plan_item_keys = settings.lesson_plan_items

    if lesson_plan_item_keys
      disabled_tab_keys = lesson_plan_item_keys.keys.reject do |tab|
        settings.settings(:lesson_plan_items, tab).enabled
      end
    end
    disabled_tab_keys.map { |tab_key| tab_key[4..] }
  end

  private

  def valid_category_id?(id)
    current_course.assessment_categories.exists?(id)
  end

  # Generates a hash that represents a single lesson plan item setting.
  #
  # Settings are stored under the course_assessments_component key of the course settings,
  # under the nested key (:lesson_plan_items, :tab_<id>).
  # Email notifications use category ID as the parent key, it was decided not to place these tab
  # settings under the category ID key as tabs could be moved between categories.
  # Grouping them all under the :lesson_plan_items key is easier to read and makes it unnecessary
  # to move settings around when the tabs get moved around.
  #
  # @param [Symbol] component_key
  # @param [Course::Assessment::Category] category
  # @param [Course::Assessment::Tab] tab
  def lesson_plan_item_setting_hash(component_key, category, tab)
    enabled_setting = settings.settings(:lesson_plan_items, "tab_#{tab.id}").enabled
    visible_setting = settings.settings(:lesson_plan_items, "tab_#{tab.id}").visible
    {
      component: component_key,
      category_title: category.title,
      tab_title: tab.title,
      options: { category_id: category.id, tab_id: tab.id },
      enabled: enabled_setting.nil? ? true : enabled_setting,
      visible: visible_setting.nil? ? true : visible_setting
    }
  end
end
