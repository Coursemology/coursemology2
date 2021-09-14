# frozen_string_literal: true
#
# This concern provides common defaults for querying and persisting email notification settings
# for a course component.
#
# The emails settings for the given component is assumed to be stored in the following
# shape in course.settings:
#
#  {
#    course_component_key: {
#      emails: {
#         item_opening: { enabled: true },
#         item_closing: { enabled: false },
#         ...
#      }
#    }
#  }
#
# To use this concern:
#   - Include the concern in the settings model for the component.
#   - Implement `.email_setting_items` and `.component_class`.
#
module Course::Settings::EmailSettingsConcern
  extend ActiveSupport::Concern

  module ClassMethods
    # Email setting items for the given component.
    #
    # @return [Hash] Each key represents an email setting. Each value is a Hash
    #   representing defaults for the email setting, e.g.
    #     {
    #       item_opening: { enabled_by_default: false },
    #       item_closing: { enabled_by_default: true, days_in_advance: 2 },
    #     }
    def email_setting_items
      raise NotImplementedError, 'Define component email settings in its settings model.'
    end

    # Returns the class of the component which the setting model is associated with.
    # This is used for querying settings when a component controller context is not available,
    # e.g. when emails are sent out asynchronously.
    #
    # @return [Class] The component class
    def component_class
      raise NotImplementedError, 'Specify component class in settings model.'
    end

    # Checks whether a type of email notification is enabled for a course.
    #
    # @param [Course] course
    # @param [Symbol] key The email notification type
    def email_enabled?(course, key)
      raise ArgumentError, 'Invalid email key' unless valid_email_setting_key?(key)

      user_setting = course.settings(component_class.key, :emails, key).enabled
      user_setting.nil? ? email_setting_items[key][:enabled_by_default] : user_setting
    end

    def valid_email_setting_key?(key)
      email_setting_items.key?(key)
    end
  end

  delegate :email_setting_items, to: :class
  delegate :valid_email_setting_key?, to: :class

  # A list of concrete email settings for the component. This is used by
  # {Course::Settings::Notifications} for the notifications settings page.
  # See {Course::Settings::Notifications#email_settings} for details of the hash shape.
  #
  # @return [Array<Hash>] Array of setting items
  def email_settings
    email_setting_items.map do |setting_key, defaults|
      user_setting = settings.settings(:emails, setting_key).enabled
      enabled = user_setting.nil? ? defaults[:enabled_by_default] : user_setting
      setting = { component: key, key: setting_key, enabled: enabled }
      respond_to?(:title) && title ? setting.merge(component_title: title) : setting
    end
  end

  # Updates an email notification setting.
  #
  # @param [Hash] attributes New setting represented by a hash with
  #  `'key'` and `'enabled'` keys, e.g. { 'key' => 'item_opening', 'enabled' => true }
  def update_email_setting(attributes)
    setting_key = attributes['key'].to_sym
    raise ArgumentError, 'Invalid email key' unless valid_email_setting_key?(setting_key)

    settings.settings(:emails, setting_key).enabled = ActiveRecord::Type::Boolean.new.cast(attributes['enabled'])
    true
  end
end
