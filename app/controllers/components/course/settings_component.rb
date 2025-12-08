# frozen_string_literal: true
class Course::SettingsComponent < SimpleDelegator
  include Course::ControllerComponentHost::Component

  # Prevent user from locking him/herself out of settings.
  def self.can_be_disabled_for_course?
    false
  end

  def sidebar_items
    admin_sidebar_items + settings_sidebar_items
  end

  private

  def admin_sidebar_items
    return [] unless can?(:manage, current_course)

    [
      {
        key: :admin_settings,
        icon: :settings,
        type: :admin,
        weight: 100,
        path: course_admin_path(current_course)
      }
    ]
  end

  def settings_sidebar_items
    [
      settings_index_item,
      settings_components_item,
      settings_sidebar_item,
      settings_notifications
    ]
  end

  def settings_index_item
    {
      key: :admin_settings_general,
      type: :settings,
      weight: 1,
      path: course_admin_path(current_course)
    }
  end

  def settings_components_item
    {
      key: :admin_settings_component_settings,
      type: :settings,
      weight: 2,
      path: course_admin_components_path(current_course)
    }
  end

  def settings_sidebar_item
    {
      key: :admin_settings_sidebar_settings,
      type: :settings,
      weight: 3,
      path: course_admin_sidebar_path(current_course)
    }
  end

  def settings_notifications
    {
      key: :admin_settings_notifications,
      type: :settings,
      weight: 12,
      path: course_admin_notifications_path(current_course)
    }
  end
end
