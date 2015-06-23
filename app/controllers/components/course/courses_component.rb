class Course::CoursesComponent
  include Course::ComponentHost::Component

  sidebar do
    [
      {
        title: t('layouts.course_settings.title'),
        path: course_admin_path(current_course),
        action: 'index'
      }
    ]
  end

  settings do
    [
      {
        title: t('layouts.course_settings.title'),
        controller: 'course/admin/admin',
        action: 'index'
      }
    ]
  end
end
