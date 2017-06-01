# frozen_string_literal: true
class Course::VirtualClassroomsComponent < SimpleDelegator
  include Course::ControllerComponentHost::Component

  def self.display_name
    I18n.t('components.virtual_classrooms.name')
  end

  def sidebar_items
    main_sidebar_items + settings_sidebar_items
  end

  def self.enabled_by_default?
    false
  end

  private

  def main_sidebar_items
    [
      {
        key: :virtual_classrooms,
        icon: 'television',
        title: settings.title || t('course.virtual_classrooms.sidebar_title'),
        weight: 1.5,
        path: course_virtual_classrooms_path(current_course)
      }
    ]
  end

  def settings_sidebar_items
    [
      {
        title: settings.title || t('layouts.course_admin.virtual_classroom_settings.title'),
        type: :settings,
        weight: 3,
        path: course_admin_virtual_classrooms_path(current_course)
      }
    ]
  end
end
