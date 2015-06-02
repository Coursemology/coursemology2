class Course::CoursesComponent
  include Course::ComponentHost::Component

  sidebar do
    [
      {
        title: t('layouts.course_settings.title'),
        path: course_settings_path(current_course),
        action: 'index'
      }
    ]
  end

  settings do
    [
      {
        title: t('layouts.course_settings.title'),
        controller: 'course/settings',
        action: 'index'
      }
    ]
  end
end
