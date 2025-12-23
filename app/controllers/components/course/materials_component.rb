# frozen_string_literal: true
class Course::MaterialsComponent < SimpleDelegator
  include Course::ControllerComponentHost::Component

  def sidebar_items
    main_sidebar_items + settings_sidebar_items
  end

  private

  def main_sidebar_items
    [
      {
        key: :materials,
        icon: :material,
        title: settings.title,
        weight: 9,
        path: course_material_folders_path(current_course)
      }
    ]
  end

  def settings_sidebar_items
    [
      {
        key: self.class.key,
        title: settings.title,
        type: :settings,
        weight: 10,
        path: course_admin_materials_path(current_course)
      }
    ]
  end
end
