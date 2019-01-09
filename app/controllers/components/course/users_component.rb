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

  # Direct the 'Manage Users' link to the usual course_users_students_path if current course user is a manager,
  # otherwise direct it to manage personalized timelines.
  def admin_sidebar_items
    can_manage_users = can?(:manage, CourseUser.new(course: current_course))
    can_manage_personal_times =
      current_course.show_personalized_timeline_features? && can?(:manage_personal_times, current_course)

    return [] unless can_manage_users || can_manage_personal_times

    [
      {
        icon: 'user-plus',
        title: t('layouts.course_users.title'),
        type: :admin,
        weight: 1,
        path:
          if can_manage_users
            course_users_students_path(current_course)
          else
            personal_times_course_users_path(current_course)
          end,
        unread: can_manage_users ? current_course.enrol_requests.count : 0
      }
    ]
  end
end
