class Course::UsersComponent < SimpleDelegator
  include Course::ControllerComponentHost::Component

  def sidebar_items
    [
      {
        title: t('layouts.course_users.title'),
        type: :admin,
        weight: 1,
        path: course_users_students_path(current_course)
      }
    ]
  end
end
