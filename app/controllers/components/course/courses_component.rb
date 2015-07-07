class Course::CoursesComponent < SimpleDelegator
  include Course::ComponentHost::Component

  def sidebar_items
    [
      {
        key: :settings,
        title: t('layouts.course_admin.title'),
        type: :admin,
        weight: 4,
        path: course_admin_path(current_course)
      }
    ]
  end

  def settings_items
    [
      {
        title: t('layouts.course_admin.title'),
        controller: 'course/admin/admin',
        action: 'index',
        weight: 1
      },
      {
        title: t('layouts.course_admin.component_settings.title'),
        controller: 'course/admin/component_settings',
        action: 'edit',
        weight: 2
      },
      {
        title: t('layouts.course_admin.sidebar_settings.title'),
        controller: 'course/admin/sidebar_settings',
        action: 'edit',
        weight: 3
      }
    ]
  end
end
