# frozen_string_literal: true
class Course::Settings::AssessmentsComponent < Course::Settings::Component
  class << self
    def category_email_setting_items
      {
        assessment_opening: { enabled_by_default: true },
        assessment_closing: { enabled_by_default: true },
        new_submission: { enabled_by_default: true },
        new_phantom_submission: { enabled_by_default: true },
        new_comment: { enabled_by_default: true },
        grades_released: { enabled_by_default: true }
      }
    end

    # Checks whether a type of email notification is enabled for an assessment category.
    #
    # @param [Course::Assessment::Category] category
    # @param [Symbol] key The email notification type
    def email_enabled?(category, key)
      raise ArgumentError, 'Invalid email key' unless valid_email_setting_key?(key)

      setting = category.course.
                settings(Course::AssessmentsComponent.key, category.id.to_s, :emails, key).enabled
      setting.nil? ? category_email_setting_items[key][:enabled_by_default] : setting
    end

    def valid_email_setting_key?(key)
      category_email_setting_items.key?(key)
    end
  end

  delegate :category_email_setting_items, to: :class
  delegate :valid_email_setting_key?, to: :class

  # Generates a list of concrete email settings meant for use on the notifications settings page.
  # See {Course::Settings::Notifications#email_settings} for details.
  #
  # @return [Array<Hash>]
  def email_settings
    current_course.assessment_categories.map do |category|
      category_email_setting_items.map do |setting_key, defaults|
        email_setting_hash(key, category, setting_key, defaults[:enabled_by_default])
      end
    end.flatten
  end

  # Updates an email notification setting.
  #
  # @param [Hash] attributes New setting represented by a hash
  #   with keys `'key'`, `'enabled'`, `'options'` keys, e.g.
  #     { 'key' => 'item_opening', 'enabled' => true, 'options' => { 'category_id' => 3 } }
  def update_email_setting(attributes)
    category_id = attributes['options']['category_id']
    setting_key = attributes['key'].to_sym
    raise ArgumentError, 'Invalid email key' unless valid_email_setting_key?(setting_key)
    raise ArgumentError, 'Invalid category id' unless valid_category_id?(category_id)

    settings.settings(category_id.to_s, :emails, setting_key).enabled = attributes['enabled']
    true
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

    disabled_tab_keys.map { |tab_key| tab_key[4..-1] }
  end

  private

  def valid_category_id?(id)
    current_course.assessment_categories.exists?(id)
  end

  # Generates a hash that represents a single email setting.
  #
  # @param [Symbol] component_key
  # @param [Course::Assessment::Category] category
  # @param [Symbol] setting_key
  # @param [Boolean] enabled_by_default
  def email_setting_hash(component_key, category, setting_key, enabled_by_default)
    setting = settings.settings(category.id.to_s, :emails, setting_key).enabled
    {
      key: setting_key,
      component: component_key,
      component_title: category.title,
      options: { category_id: category.id },
      enabled: setting.nil? ? enabled_by_default : setting
    }
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
    setting = settings.settings(:lesson_plan_items, "tab_#{tab.id}").enabled
    {
      component: component_key,
      category_title: category.title,
      tab_title: tab.title,
      options: { category_id: category.id, tab_id: tab.id },
      enabled: setting.nil? ? true : setting
    }
  end
end
