# frozen_string_literal: true
class Course::UsersComponent < SimpleDelegator
  include Course::ControllerComponentHost::Component

  def sidebar_items
    main_sidebar_items + admin_sidebar_items
  end

  private

  def main_sidebar_items
    [
      {
        title: t('course.users.sidebar_title'),
        key: :users,
        weight: 6,
        path: course_users_path(current_course)
      }
    ]
  end

  def admin_sidebar_items
    return [] unless can?(:manage, CourseUser.new(course: current_course))

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
