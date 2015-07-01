class Course::CoursesComponent
  include Course::ComponentHost::Component

  sidebar do
    [
      {
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
        action: 'index'
      }
    ]
  end
end
