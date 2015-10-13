class Course::MaterialsComponent < SimpleDelegator
  include Course::ControllerComponentHost::Component

  def sidebar_items
    [
      {
        key: :materials,
        title: I18n.t('course.material.sidebar_title'),
        weight: 4,
        path: course_material_folder_path(current_course, current_course.root_folder),
        unread: 0
      }
    ]
  end
end
