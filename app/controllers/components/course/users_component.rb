class Course::UsersComponent < SimpleDelegator
  include Course::ComponentHost::Component

  def sidebar_items
    [
      {
        key: :users,
        title: t('layouts.course_users.title'),
        type: :admin,
        weight: 1,
        path: course_users_students_path(current_course),
        action: 'students'
      }
    ]
  end
end
