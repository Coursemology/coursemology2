# frozen_string_literal: true
class Course::MaterialsComponent < SimpleDelegator
  include Course::ControllerComponentHost::Component

  def self.display_name
    I18n.t('components.materials.name')
  end

  def sidebar_items
    main_sidebar_items + settings_sidebar_items
  end

  def settings
    @settings ||= Course::MaterialSettings.new(current_course.settings(:material))
  end

  private

  def main_sidebar_items
    [
      {
        key: :materials,
        title: settings.title || t('course.material.sidebar_title'),
        weight: 8,
        path: course_material_folder_path(current_course, current_course.root_folder),
        unread: 0
      }
    ]
  end

  def settings_sidebar_items
    [
      {
        title: t('course.material.sidebar_title'),
        type: :settings,
        weight: 4,
        path: course_admin_materials_path(current_course)
      }
    ]
  end
end
