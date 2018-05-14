# frozen_string_literal: true
class Course::UsersComponent < SimpleDelegator
  include Course::ControllerComponentHost::Component

  def self.can_be_disabled_for_course?
    false
  end

  def self.display_name
    I18n.t('components.users.name')
  end

  def sidebar_items
    main_sidebar_items + admin_sidebar_items
  end

  private

  def main_sidebar_items
    [
      {
        key: :users,
        icon: 'group',
        title: t('course.users.sidebar_title'),
        weight: 7,
        path: course_users_path(current_course)
      }
    ]
  end

  def admin_sidebar_items
    return [] unless can?(:manage, CourseUser.new(course: current_course))

    [
      {
        icon: 'user-plus',
        title: t('layouts.course_users.title'),
        type: :admin,
        weight: 1,
        path: course_users_students_path(current_course),
        unread: current_course.enrol_requests.count
      }
    ]
  end
end
