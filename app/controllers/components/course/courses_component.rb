# frozen_string_literal: true
class Course::CoursesComponent < SimpleDelegator
  include Course::ControllerComponentHost::Component

  def self.can_be_disabled?
    false
  end

  def self.display_name
    I18n.t('components.courses.name')
  end

  def sidebar_items
    admin_sidebar_items + settings_sidebar_items
  end

  private

  def admin_sidebar_items
    return [] unless can?(:manage, current_course)

    [
      {
        icon: 'gear',
        title: t('layouts.course_admin.title'),
        type: :admin,
        weight: 9,
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
      title: t('layouts.course_admin.course_settings.title'),
      type: :settings,
      weight: 1,
      path: course_admin_path(current_course)
    }
  end

  def settings_components_item
    {
      title: t('layouts.course_admin.component_settings.title'),
      type: :settings,
      weight: 2,
      path: course_admin_components_path(current_course)
    }
  end

  def settings_sidebar_item
    {
      title: t('layouts.course_admin.sidebar_settings.title'),
      type: :settings,
      weight: 3,
      path: course_admin_sidebar_path(current_course)
    }
  end

  def settings_notifications
    {
      title: t('layouts.course_admin.notifications.title'),
      type: :settings,
      weight: 12,
      path: course_admin_notifications_path(current_course)
    }
  end
end
