class Course::CoursesModule
  include Course::CoursesController::Module

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
