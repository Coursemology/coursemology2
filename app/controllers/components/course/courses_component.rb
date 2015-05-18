class Course::CoursesComponent
  include Course::ComponentHost::Component

  settings do
    [
      {
        title: t('layouts.course_settings.title'),
        controller: 'course/course_settings',
        action: 'index'
      }
    ]
  end
end
