class Course::CoursesComponent
  include Course::ComponentHost::Component

  sidebar do
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

  settings do
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
      }
    ]
  end
end
